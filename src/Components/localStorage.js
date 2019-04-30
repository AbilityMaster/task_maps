class LocalStorage {
	constructor(version, name) {
		this.key = `${name}_${version}`;
	}

	set dataset(obj) {
		let temp = JSON.parse(localStorage.getItem(this.key));

		if (temp) {
			for (let key in temp) {
				if (!temp.hasOwnProperty(key)) {
					continue;
				}

				if (obj[key] !== undefined) {
					temp[key] = obj[key];
				}
			}

			for (let key in obj) {
				if (!obj.hasOwnProperty(key)) {
					continue;
				}

				if (temp[key] === undefined) {
					temp[key] = obj[key];
				}
			}
			
			localStorage.setItem(this.key, JSON.stringify(temp));
			
			return;
		} 

		localStorage.setItem(this.key, JSON.stringify(obj));
	}
	
	get isEmpty() {
		return this.dataset === null
	}

	get dataset() {
		return JSON.parse(localStorage.getItem(this.key));
	}
}

export default LocalStorage;