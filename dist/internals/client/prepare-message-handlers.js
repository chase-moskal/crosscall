export const prepareMessageHandlers = ({ state, resolveReady }) => {
    function passResponseToRequest(response) {
        const pending = state.requests.get(response.associate);
        if (!pending)
            throw new Error(`unknown response, id "${response.id}" `
                + `responding to "${response.associate}"`);
        const { resolve, reject } = pending;
        state.requests.delete(response.associate);
        if (response.signal === 0 /* Error */)
            reject(response.error);
        else
            resolve(response);
    }
    const prepPasser = () => async (response) => passResponseToRequest(response);
    return {
        [0 /* Error */]: prepPasser(),
        [1 /* Wakeup */]: async () => {
            if (!state.isReady) {
                resolveReady();
                state.isReady = true;
            }
        },
        [3 /* CallResponse */]: prepPasser(),
        [6 /* EventListenResponse */]: prepPasser(),
        [8 /* EventUnlistenResponse */]: prepPasser(),
        [4 /* Event */]: async (message) => {
            const { listenerOrganizer } = state;
            const { listenerId, eventPayload } = message;
            const listener = listenerOrganizer.listeners.get(listenerId);
            if (listener)
                listener(eventPayload);
        }
    };
};
//# sourceMappingURL=prepare-message-handlers.js.map