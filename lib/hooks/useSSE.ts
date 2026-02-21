import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getConfig } from '../config';

/**
 * Options for the useSSE hook
 *
 * @typeParam EventMap - Maps SSE event names to their parsed JSON data types
 */
export interface UseSSEOptions<EventMap extends Record<string, unknown> = Record<string, unknown>> {
  /** API path resolved against quantum-ui baseURL (e.g. '/cloud-api/events/whatsapp') */
  path: string;
  /** SSE event names to listen for via addEventListener */
  events: (keyof EventMap & string)[];
  /** Whether to connect. Set false to disconnect. @default true */
  enabled?: boolean;
  /** Whether to send cookies with the request. @default true */
  withCredentials?: boolean;
  /** Called when the EventSource connection encounters an error */
  onError?: (event: Event) => void;
  /** Called when the EventSource connection opens */
  onOpen?: () => void;
}

/**
 * Return type for the useSSE hook
 *
 * @typeParam EventMap - Maps SSE event names to their parsed JSON data types
 */
export interface UseSSEReturn<EventMap extends Record<string, unknown>> {
  /** The SSE event name of the last received event */
  eventType: keyof EventMap | null;
  /** The parsed JSON data of the last received event */
  data: EventMap[keyof EventMap] | null;
  /** UPPER_CASE enum of event names for comparison (e.g. eventTypes.VERIFIED === 'verified') */
  eventTypes: { [K in keyof EventMap as Uppercase<K & string>]: K };
  /** Whether the EventSource connection is currently open */
  isConnected: boolean;
  /** Human-readable error message if the connection failed */
  error: string | null;
  /** Manually close the connection */
  disconnect: () => void;
}

/**
 * Generic Server-Sent Events hook that returns the last event as `eventType` + `data`.
 *
 * Registers a `addEventListener` for each name in `events`, parses `event.data`
 * as JSON, and stores the latest event type and data in state.
 *
 * @typeParam EventMap - Maps SSE event names to their data shapes
 *
 * @example
 * ```tsx
 * type VerificationEvents = {
 *   initiated: { verificationCode: string; instructions: string };
 *   verified: { phone: string };
 *   error: { message: string };
 *   expired: { message: string };
 * };
 *
 * const { eventType, data, eventTypes, disconnect } = useSSE<VerificationEvents>({
 *   path: '/cloud-api/onboarding/mobile-verification/events/whatsapp',
 *   events: ['initiated', 'verified', 'error', 'expired'],
 * });
 *
 * if (!eventType) return <Spinner />;
 * if (eventType === eventTypes.VERIFIED) handleSuccess((data as VerificationEvents['verified']).phone);
 * if (eventType === eventTypes.INITIATED) return <QRCode value={(data as VerificationEvents['initiated']).verificationCode} />;
 * ```
 */
export function useSSE<EventMap extends Record<string, unknown> = Record<string, unknown>>(
  options: UseSSEOptions<EventMap>,
): UseSSEReturn<EventMap> {
  const { path, events: eventNames = [], enabled = true, withCredentials = true } = options;

  const eventSourceRef = useRef<EventSource | null>(null);
  const [eventType, setEventType] = useState<keyof EventMap | null>(null);
  const [data, setData] = useState<EventMap[keyof EventMap] | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Store options in a ref for stable access inside event handlers
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Stable serialized key for the events array
  const eventsKey = eventNames.join(',');

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      disconnect();
      setEventType(null);
      setData(null);
      return;
    }

    // Build full URL from quantum-ui config
    const config = getConfig();
    const sseUrl = `${config.axios.baseURL}${path}`;

    const eventSource = new EventSource(sseUrl, { withCredentials });
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
      optionsRef.current.onOpen?.();
    };

    eventSource.onerror = (event) => {
      setIsConnected(false);
      if (eventSource.readyState === EventSource.CLOSED) {
        setError('Connection lost.');
        optionsRef.current.onError?.(event);
      }
    };

    // Register one addEventListener per event name
    const handlers: { name: string; handler: EventListener }[] = [];
    const names = eventsKey.split(',').filter(Boolean);

    for (const name of names) {
      const handler = (event: Event) => {
        try {
          const parsed = JSON.parse((event as MessageEvent).data as string);
          setEventType(name as keyof EventMap);
          setData(parsed);
        } catch (e) {
          console.error(`Failed to parse SSE event '${name}':`, e);
        }
      };

      eventSource.addEventListener(name, handler);
      handlers.push({ name, handler });
    }

    return () => {
      for (const { name, handler } of handlers) {
        eventSource.removeEventListener(name, handler);
      }
      disconnect();
    };
  }, [enabled, path, eventsKey, withCredentials, disconnect]);

  // Build UPPER_CASE enum from event names: { INITIATED: 'initiated', VERIFIED: 'verified', ... }
  type EventTypesMap = { [K in keyof EventMap as Uppercase<K & string>]: K };
  const eventTypes = useMemo(() => {
    const map = {} as EventTypesMap;
    for (const name of eventsKey.split(',').filter(Boolean)) {
      (map as Record<string, string>)[name.toUpperCase()] = name;
    }
    return map;
  }, [eventsKey]);

  return { eventType, data, eventTypes, isConnected, error, disconnect };
}
