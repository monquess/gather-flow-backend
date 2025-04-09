export interface ConfigFactory<T> {
	createOptions(): T | Promise<T>;
}
