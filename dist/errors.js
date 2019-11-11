export class CrosscallApiError extends Error {
    constructor() {
        super(...arguments);
        this.name = this.constructor.name;
    }
}
export const err = (message) => new CrosscallApiError(message);
//# sourceMappingURL=errors.js.map