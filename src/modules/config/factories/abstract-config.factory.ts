export abstract class ConfigFactory<T> {
	abstract createOptions(): Promise<T> | T;
}
