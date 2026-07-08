import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getConfig } from '../config';

export interface UseSSEOptions<EventMap extends Record<string, unknown> = Record<string, unknown>> {
  path: string;
  events: (keyof EventMap & string)[];
  enabled?: boolean;
  autoReconnect?: boolean;
  withCredentials?: boolean;
  onError?: (event: Event) => void;
  onOpen?: () => void;
}

export interface UseSSEReturn<EventMap extends Record<string, unknown>> {
  eventType: keyof EventMap | null;
  data: EventMap[keyof EventMap] | null;
  eventTypes: { [K in keyof EventMap as Uppercase<K & string>]: K };
  isConnected: boolean;
  error: string | null;
  disconnect: () => void;
}

// Generic Server-Sent Events hook that returns the last event as `eventType` + `data`.
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

      // When autoReconnect is false, close on any error to prevent browser reconnect
      if (!optionsRef.current.autoReconnect && optionsRef.current.autoReconnect !== undefined) {
        eventSource.close();
        eventSourceRef.current = null;
        return;
      }

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
