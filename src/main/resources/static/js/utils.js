/**
 * 
 */

var LocalStorageItem = {
		set: function(itemName, itemValue) {
			typeof(Storage) !== "undefined" && localStorage.setItem(itemName, itemValue);
		},
		get: function(itemName, notfoundDefault) {
			return typeof(Storage) !== "undefined" && (localStorage.getItem(itemName) || notfoundDefault);
		},
		getInteger: function(itemName, notfoundDefault) {
			return parseInt(this.get(itemName, notfoundDefault));
		},
		getBoolean: function(itemName, notfoundDefault) {
			if (notfoundDefault) {
				return this.get(itemName, notfoundDefault.toString()) === 'true';
			} else {
				return this.get(itemName) === 'true';
			}
		}
};
