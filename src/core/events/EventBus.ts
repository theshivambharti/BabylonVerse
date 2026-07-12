export type EventHandler<T = any> = (payload: T) => void;

export class EventBus {
    private static _instance: EventBus;
    private _handlers: Map<string, EventHandler[]> = new Map();

    private constructor() {}

    public static initialize(): EventBus {
        if (!EventBus._instance) {
            EventBus._instance = new EventBus();
        }
        return EventBus._instance;
    }

    public static get instance(): EventBus {
        if (!EventBus._instance) {
            throw new Error("EventBus not initialized. Call initialize() first.");
        }
        return EventBus._instance;
    }

    /**
     * Subscribe to an event
     */
    public on<T>(event: string, handler: EventHandler<T>): void {
        if (!this._handlers.has(event)) {
            this._handlers.set(event, []);
        }
        this._handlers.get(event)!.push(handler as EventHandler);
    }

    /**
     * Unsubscribe from an event
     */
    public off<T>(event: string, handler: EventHandler<T>): void {
        if (!this._handlers.has(event)) return;
        const handlers = this._handlers.get(event)!;
        const index = handlers.indexOf(handler as EventHandler);
        if (index > -1) {
            handlers.splice(index, 1);
        }
    }

    /**
     * Emit an event to all subscribers
     */
    public emit<T>(event: string, payload?: T): void {
        if (!this._handlers.has(event)) return;
        
        // Create a copy of the array to prevent iteration issues if handlers are removed during emit
        const handlers = [...this._handlers.get(event)!];
        for (const handler of handlers) {
            handler(payload);
        }
    }
}
