
export default function error(message: string) {
	return new Error(`crosscall-error: ${message}`)
}
