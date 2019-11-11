export class ListenerOrganizer {
    constructor() {
        this.ids = new Map();
        this.listeners = new Map();
    }
    add(id, listener) {
        this.ids.set(listener, id);
        this.listeners.set(id, listener);
    }
    remove(id, listener) {
        this.ids.delete(listener);
        this.listeners.delete(id);
    }
}
//# sourceMappingURL=listener-organizer.js.map