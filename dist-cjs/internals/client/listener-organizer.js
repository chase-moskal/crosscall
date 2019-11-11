"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ListenerOrganizer {
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
exports.ListenerOrganizer = ListenerOrganizer;
//# sourceMappingURL=listener-organizer.js.map