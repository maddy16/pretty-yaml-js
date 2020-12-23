var YAML = require('yaml')
const fs = require('fs')

function main() {
	const input = YAML.parse(fs.readFileSync('./data.yml', 'utf-8'))
	let output = {}
	for (const [key, value] of Object.entries(input)) {
		let cur = output;
		let field = '';
		const strippedKey = stripeInternalObjects(key);
		const splittedKeys = strippedKey.split('.');
		splittedKeys.forEach(function(item,index) {
			item = item.replace(/\_/g,".");
			if (field !== '') {
				if(isArray(field)) {
					cur = adjustArrayData(field,item,value,cur);
				} else {
					if (field in cur) {
						cur = cur[field]
					} else {

						cur = cur[field] = {}
					}
				}

			}
			field = item;
			if(index===splittedKeys.length-1 && isArray(field)) {
				cur = adjustArrayData(field, null,value,cur);
			}
		});
		if(!isArray(field)) {
			cur[field] = value
		}

	}

	const result = YAML.stringify(output).replace(/\"/g, '');
	fs.writeFile('./result.yml', result, err => { err && console.log(err)})

}

function adjustArrayData(field, item, value, cur) {
	let currentArrayParams = extractArrayElements(field);

	const fieldName =  currentArrayParams.name;
	if(fieldName in cur) {
		if(isArray(item)) {
			return adjustArrayData(item, null,value,cur[fieldName][currentArrayParams.index]);
		} else {
			if(cur[fieldName].length===currentArrayParams.index) {
				if(item) {
					cur = cur[fieldName].push({
						[item]: value
					})
				} else {
					cur[fieldName].push(value)
				}

			} else {
				if(item) {
					cur=cur[fieldName][currentArrayParams.index][item]=value;
				} else {
					cur=cur[fieldName][currentArrayParams.index] = value;
				}

			}
		}


	} else {
		if(item) {
			cur = cur[fieldName] = [
				{
					[item]: value
				}
			];
		} else {
			cur = cur[fieldName] = [value];
		}

	}

	return cur;
}

function isArray(key) {
	return key && key.includes('[') && key.includes(']') && !isNaN(parseInt(key.substring(key.indexOf('[')).replace('[','').replace(']','')));
}

function extractArrayElements(key) {
	return {
		name: key.substring(0,key.indexOf('[')),
		index: parseInt(key.substring(key.indexOf('[')).replace('[','').replace(']',''))
	};
}

function stripeInternalObjects(key) {
	if(key.includes('[') && key.includes(']')) {
		const start = key.indexOf('[');
		const end = key.indexOf(']');
		let substr = key.substring(start+1,end);
		if(substr.includes('.')) {
			const underScored = substr.split('.').join('_');
			key = key.replace(substr,underScored);
		}
	}
	return key;
}
main()
