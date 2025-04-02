abstract class Factory<T> {
	protected _count: number;
	protected _data: T[] = [];

	constructor(count: number) {
		this._count = count;
	}

	abstract create(): void;

	get data(): T[] {
		return this._data;
	}
}

export default Factory;
