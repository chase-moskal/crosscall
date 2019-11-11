"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function enforcePermissions({ origin, exposure }) {
    let permitted = false;
    if (!exposure.cors)
        throw new Error(`cors permissions must be specified`);
    const { allowed, forbidden } = exposure.cors;
    if (!allowed)
        throw new Error(`cors.allowed must be specified`);
    if (allowed.test(origin))
        permitted = true;
    if (forbidden && forbidden.test(origin))
        permitted = false;
    if (!permitted)
        throw new Error(`not permitted`);
    return permitted;
}
exports.enforcePermissions = enforcePermissions;
function getExposure({ topic, exposures }) {
    const exposure = exposures[topic];
    if (!exposure)
        throw new Error(`unknown exposure topic "${topic}"`);
    return exposure;
}
exports.getExposure = getExposure;
function getMethodExecutor({ func, params, exposure }) {
    const method = exposure.exposed[func];
    if (!method)
        throw new Error(`unknown method "${func}"`);
    return () => method.apply(exposure, params);
}
exports.getMethodExecutor = getMethodExecutor;
function getEventMediator({ eventName, exposure }) {
    const mediator = exposure.exposed[eventName];
    if (!mediator)
        throw new Error(`unknown event "${eventName}"`);
    return mediator;
}
exports.getEventMediator = getEventMediator;
function getListenerData({ listenerId, listeners }) {
    const listenerData = listeners.get(listenerId);
    if (!listenerData)
        throw new Error(`unknown listener id "${listenerId}"`);
    return listenerData;
}
exports.getListenerData = getListenerData;
//# sourceMappingURL=validation.js.map