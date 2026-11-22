import Decimal from '../../utils/decimal';
import type { DisplayQuantity } from '../../utils/format';

export type QuantityUnit = {
  id: string;
  name: string;
  symbol: string;
  // Exact ratio to the primary unit: `primaryUomQty` primary units = `uomQty` of this unit (strip: 10 = 1; primary: 1 = 1)
  primaryUomQty: number;
  uomQty: number;
  // Whether the unit is one of the item's own pack conversions (box, strip) rather than a unit of its primary unit's
  // family (L, kg); a unit that doesn't say counts as a pack
  isPack?: boolean;
};

const PRIMARY_DECIMALS = 3;
const UNIT_DECIMALS = 6;
const QUANTITY_PLACEHOLDER = /\{\{qty:(-?[\d.]+)\}\}/g;

export const PRIMARY_UNIT_PLACEHOLDER = '{{primaryUnit}}';

// Parses a typed amount into a Decimal, or null when it is empty or not a finite number
function parseAmount(amount: string): Decimal | null {
  const text = amount.trim();
  if (text === '' || !Number.isFinite(Number(text))) return null;
  return new Decimal(text);
}

// Converts an amount typed in `unit` to the primary unit, rounded to 3 dp; empty or invalid text gives undefined
export function toPrimaryQty(amount: string, unit: QuantityUnit): number | undefined {
  const parsed = parseAmount(amount);
  if (!parsed) return undefined;
  return parsed.times(unit.primaryUomQty).div(unit.uomQty).toDecimalPlaces(PRIMARY_DECIMALS).toNumber();
}

// Expresses a primary-unit quantity as text in `unit`, without trailing zeros; a missing quantity gives ''
export function fromPrimaryQty(primaryQty: number | null | undefined, unit: QuantityUnit): string {
  if (primaryQty == null || !Number.isFinite(primaryQty)) return '';
  return new Decimal(primaryQty).times(unit.uomQty).div(unit.primaryUomQty).toDecimalPlaces(UNIT_DECIMALS).toFixed();
}

// One unit's share of a quantity: how many of `unit` it takes
export type QuantityPiece = { unit: QuantityUnit; amount: Decimal };

// Primary units in one of `unit` (strip of 10: 10; a pack of 5 tab sold as 2: 2.5)
export function unitSize(unit: QuantityUnit): Decimal {
  return new Decimal(unit.primaryUomQty).div(unit.uomQty);
}

// A pack is one of the item's own conversions (box, strip); a unit of the primary unit's family (L, kg) is not, and
// never takes a share of a breakdown. Units that don't say are packs
function isPackUnit(unit: QuantityUnit, primaryUnitId: string): boolean {
  return unit.id !== primaryUnitId && unit.isPack !== false;
}

// The units a quantity read in `anchor` breaks down through: the anchor, then — when cascading — every smaller pack
// that fits evenly into the one above it, largest first; the primary unit takes the rest
function packLadder(anchor: QuantityUnit, units: QuantityUnit[], primaryUnitId: string, cascade: boolean) {
  const ladder = [anchor];
  if (!cascade) return ladder;
  const smaller = units
    .filter((unit) => isPackUnit(unit, primaryUnitId) && unit.id !== anchor.id)
    .filter((unit) => unitSize(unit).lt(unitSize(anchor)) && unitSize(unit).gt(1))
    .sort((a, b) => unitSize(b).cmp(unitSize(a)));
  for (const unit of smaller) {
    if (
      unitSize(ladder[ladder.length - 1])
        .mod(unitSize(unit))
        .isZero()
    )
      ladder.push(unit);
  }
  return ladder;
}

// Splits a primary quantity as it reads in the anchor unit. A pack anchor takes whole packs — then, when cascading, whole
// units of every smaller pack that fits evenly into the one above (952 tab in boxes: 9 box, 5 strip, 2 tab) — and the
// primary unit takes what is left, decimals included. A family unit (L, kg) reads as one exact figure
export function breakDownQty(
  primaryQty: number,
  units: QuantityUnit[],
  anchorUnitId: string,
  primaryUnitId: string,
  cascade = false,
): QuantityPiece[] {
  const primary = units.find((unit) => unit.id === primaryUnitId);
  if (!primary || !Number.isFinite(primaryQty)) return [];
  const anchor = units.find((unit) => unit.id === anchorUnitId) ?? primary;
  const total = new Decimal(primaryQty);
  if (anchor.id !== primary.id && !isPackUnit(anchor, primaryUnitId)) {
    return [{ unit: anchor, amount: total.div(unitSize(anchor)).toDecimalPlaces(PRIMARY_DECIMALS) }];
  }
  const pieces: QuantityPiece[] = [];
  let left = total;
  if (anchor.id !== primary.id) {
    for (const unit of packLadder(anchor, units, primaryUnitId, cascade)) {
      const amount = left.div(unitSize(unit)).floor();
      pieces.push({ unit, amount });
      left = left.minus(amount.times(unitSize(unit)));
    }
  }
  pieces.push({ unit: primary, amount: left.toDecimalPlaces(PRIMARY_DECIMALS) });
  return pieces;
}

// The units the breakdown panel takes entries in, largest first: the primary unit, every pack, and the anchor when it is
// a family unit
export function entryUnits(units: QuantityUnit[], primaryUnitId: string, anchorUnitId: string | undefined) {
  return units
    .filter((unit) => unit.id === primaryUnitId || unit.id === anchorUnitId || isPackUnit(unit, primaryUnitId))
    .sort((a, b) => unitSize(b).cmp(unitSize(a)));
}

// Whether a unit's entry may have decimals: the primary unit and its family units, when the primary unit allows them
export function takesDecimals(unit: QuantityUnit, primaryUnitId: string, allowDecimal: boolean): boolean {
  return allowDecimal && !isPackUnit(unit, primaryUnitId);
}

// A primary quantity as the server reads it in the item's display unit, for quantities it hasn't seen yet (levels being
// typed): the exact figure, whole display units and the primary units left over, and — for a pack — the breakdown,
// through every smaller pack when cascading. Null until the primary unit is among the units
export function toDisplayQuantity(
  primaryQty: number,
  units: QuantityUnit[],
  primaryUnitId: string,
  displayUnitId: string,
  cascade = false,
): Required<DisplayQuantity> | null {
  const primary = units.find((unit) => unit.id === primaryUnitId);
  if (!primary || !Number.isFinite(primaryQty)) return null;
  const display = units.find((unit) => unit.id === displayUnitId) ?? primary;
  const size = unitSize(display);
  const total = new Decimal(primaryQty);
  const whole = total.div(size).trunc();
  const isPack = isPackUnit(display, primaryUnitId);
  const breakdown =
    isPack && primaryQty >= 0
      ? breakDownQty(primaryQty, units, display.id, primaryUnitId, cascade)
          .filter((piece) => !piece.amount.isZero())
          .map((piece) => ({ qty: piece.amount.toNumber(), symbol: piece.unit.symbol }))
      : [];
  return {
    primaryUomQty: primaryQty,
    displayUomQty: total.div(size).toDecimalPlaces(PRIMARY_DECIMALS).toNumber(),
    wholeDisplayUomQty: whole.toNumber(),
    remainderPrimaryUomQty: total.minus(whole.times(size)).toDecimalPlaces(PRIMARY_DECIMALS).toNumber(),
    displayUomSymbol: display.symbol,
    primaryUomSymbol: primary.symbol,
    isPack,
    breakdown,
  };
}

// Adds up the amounts typed per unit into the primary unit, rounded to 3 dp; nothing typed gives undefined
export function sumParts(parts: Record<string, string>, units: QuantityUnit[]): number | undefined {
  let total: Decimal | null = null;
  for (const unit of units) {
    const amount = parseAmount(parts[unit.id] ?? '');
    if (amount) total = (total ?? new Decimal(0)).plus(amount.times(unitSize(unit)));
  }
  return total?.toDecimalPlaces(PRIMARY_DECIMALS).toNumber();
}

// The amounts per unit a primary quantity is entered as: its breakdown in a pack anchor, zero shares left out, or all of
// it in the primary unit when the anchor is a family unit; nothing at all reads as 0 in the unit it is entered in
export function partsOfQty(
  primaryQty: number | null | undefined,
  units: QuantityUnit[],
  anchorUnitId: string,
  primaryUnitId: string,
  cascade = false,
): Record<string, string> {
  if (primaryQty == null) return {};
  const anchor = units.find((unit) => unit.id === anchorUnitId);
  const enteredIn = anchor && isPackUnit(anchor, primaryUnitId) ? anchorUnitId : primaryUnitId;
  const parts = breakDownQty(primaryQty, units, enteredIn, primaryUnitId, cascade).filter(
    (piece) => !piece.amount.isZero(),
  );
  if (parts.length === 0) return { [enteredIn]: '0' };
  return Object.fromEntries(parts.map((piece) => [piece.unit.id, piece.amount.toFixed()]));
}

// Names a primary-unit quantity in a validation message; QuantityField shows it in the unit being entered
export function quantityPlaceholder(primaryQty: number): string {
  return `{{qty:${primaryQty}}}`;
}

// Writes a validation message's quantities in the unit being entered and its primary-unit placeholder as that unit
export function resolveQuantityMessage(
  message: string,
  unit: QuantityUnit,
  primaryUnit: QuantityUnit,
  formatNumber: (value: number) => string,
): string {
  return message
    .replace(
      QUANTITY_PLACEHOLDER,
      (_, qty: string) => `${formatNumber(Number(fromPrimaryQty(Number(qty), unit)))} ${unit.symbol}`,
    )
    .split(PRIMARY_UNIT_PLACEHOLDER)
    .join(primaryUnit.symbol);
}
