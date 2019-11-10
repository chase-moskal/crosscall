
export class CrosscallApiError extends Error {
	readonly name = this.constructor.name

	constructor(message: string) {
		super(`crosscall-error: ${message}`)
	}
}

export function err(message: string) {
	return new CrosscallApiError(message)
}
