var uniqueOptionId = 0;

function Option(name, value) {
	this.name = name || "Default Item Name";
	this.value = value || 1;
	this.id = uniqueOptionId++;
}

module.exports = Option;
