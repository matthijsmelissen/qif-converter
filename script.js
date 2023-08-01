window.onload = function() {
	var fileInput = document.getElementById('file-input');
	var form = document.getElementById('form');

	form.addEventListener('submit', function(e) {
		e.preventDefault();
		var file = fileInput.files[0];

		var reader = new FileReader();

		reader.onload = function(e) {
			output = convertRegister(reader.result, document.getElementById('bank').value);
			newFileName = file.name.replace('.csv','')+'.qif';
			download(output, newFileName);
		}

		reader.readAsText(file);
	});
}

function parseCsv(file, bank) {
	var delimiter;

	if (bank == 'ing') delimiter = ';';
	if (bank == 'asn') delimiter = ',';
	if (bank == 'bcee') delimiter = ';';
	if (bank == 'rabobank') delimiter = ',';
	if (bank == 'abnamro') delimiter = ',';
	if (bank == 'seb') delimiter = ',';
	if (bank == 'skandia') delimiter = ',';
	if (bank == 'jak') delimiter = ',';

	if (bank == 'abnamro' || bank == 'ing') {
		var header = true;
	} else {
		var header = false;
	}

	data = Papa.parse(file, {delimiter: delimiter, header: header});

	return data.data;
}

function convertRegister(file, bank) {
	var inputData = parseCsv(file, bank);

	var registerQif = '!Type:Bank\n\n';
	for (var i in inputData) {
		var transactionCsv = inputData[i];

		// skip rows with too few fields
		if (countProperties(transactionCsv) < 3)
			continue;

		//For skandia, SEB and JAK, skip rows not starting with a year
	    if ((bank == 'seb' || bank == 'skandia' || bank == 'jak'))
	    	if (transactionCsv[0].substr(0,2) != '20')
	    		continue;
   
		registerQif += convertTransaction(transactionCsv, bank);
	}

	return registerQif;
}

function convertTransaction(transactionCsv, bank) {
	var fields;
	if (bank == 'bcee') fields = bcee(transactionCsv);
	if (bank == 'ing') fields = ing(transactionCsv);
	if (bank == 'rabobank') fields = rabobank(transactionCsv);
	if (bank == 'abnamro') fields = abnamro(transactionCsv);
	if (bank == 'seb') fields = seb(transactionCsv);
	if (bank == 'skandia') fields = skandia(transactionCsv);
	if (bank == 'jak') fields = jak(transactionCsv);
	if (bank == 'asn') fields = asn(transactionCsv);

	var transaction = '';
	transaction += 'D' + fields['date'] + '\n';
	transaction += 'T' + fields['amount'] + '\n';
	transaction += 'P' + fields['payee'] + '\n';
	if (fields['category']) transaction += 'L' + fields['category'] + '\n';

	transaction += '^\n\n';
	return transaction;
}


function bcee(row) {
	row[0] = row[0].replace(/\0/g,'');
	row[1] = row[1].replace(/\0/g,'');
	row[2] = row[2].replace(/\0/g,'');
	row[3] = row[3].replace(/\0/g,'');

	var fields = {};

	fields['date'] = row[0];
	fields['amount'] = row[2].replace(/\xA0/g, '').replace(/ /g, '').replace(/,/g, '.'); //this is not a space but some strange character

	fields['payee'] = row[1];
	fields['payee'] = fields['payee'].replace(/\s\s+/g, ' ').trim();
	fields['category'] = '';

	return fields;
}

function ing(row) {
	row = Object.values(row);
	var fields = {};
	fields['date'] = row[0].substr(4,2) + '/' + row[0].substr(6,2) + '/' + row[0].substr(0,4);
	fields['amount'] = (((row[5] == 'Af' || row[5] == 'Debit') ? '-' : '') + row[6]).replace(/,/g, '.');
	fields['payee'] = row[1] + ' ' + row[8] + ' ' + row[3];
	fields['payee'] = fields['payee'].replace(/\s\s+/g, ' ').trim();
	fields['category'] = row[4];

	return fields;
}

function rabobank(row) {
    // Rabobank CSV strucure based on:
    // https://bankieren.rabobank.nl/klanten/bedrijven/help/specificaties_elektronische_betaaldiensten/rabo_internetbankieren_professional/export/ --> 'CSV (kommagescheiden nieuw)'

    var fields = {};
    fields['date'] = row[2].substr(4,2) + '/' + row[2].substr(6,2) + '/' + row[2].substr(0,4);
    fields['amount'] = (row[3] == 'C' ? row[4] : '-'+row[4]).replace(/,/g, '.');
    fields['payee'] = row[5] + ' ' + row[6];
    fields['payee'] = fields['payee'].replace(/\s\s+/g, ' ').trim();
    fields['category'] = '';

    return fields;
}

function abnamro(row) {
	var fields = {};
    fields['date'] = row['Transactiedatum'].substr(4,2) + '/' + row['Transactiedatum'].substr(6,2) + '/' + row['Transactiedatum'].substr(0,4);
    fields['amount'] = row['Transactiebedrag'];
    fields['payee'] = row['Omschrijving'];
    fields['category'] = '';
    return fields;
}

function seb(row) {
    var fields = {};
    fields['date'] = row[0].substr(5,2) + "/" + row[0].substr(8,2) + "/" + row[0].substr(0,4);
    fields['amount'] = row[4].replace(/,/g,'.').replace(/\s/g,'');
    fields['payee'] = row[3];
    fields['category'] = '';
    return fields;
}

function skandia(row) {
    var fields = {};
    fields['date'] = row[0].substr(5,2) + "/" + row[0].substr(8,2) + "/" + row[0].substr(0,4);
    fields['amount'] = row[2].replace(/,/g,'.').replace(/\s/g,'');
    fields['payee'] = row[1];
    fields['category'] = '';
    return fields;
}

function jak(row) {
    var fields = {};
    fields['date'] = row[0].substr(5,2) + "/" + row[0].substr(8,2) + "/" + row[0].substr(0,4);
    fields['amount'] = row[2].replace(/,/g,'.').replace(/\s/g,'');
    fields['payee'] = row[1];
    fields['category'] = '';
    return fields;
}

function asn(row) {
	var fields = {};
    fields['date'] = row[0].substr(3,2) + "/" + row[0].substr(0,2) + "/" + row[0].substr(6,4);
    fields['amount'] = row[10].replace(/,/g,'.').replace(/\s/g,'');
    fields['payee'] = row[3] + " " + row[17].replace("'", '');
    fields['category'] = '';
    return fields;
}

function download(text, filename) {
	var element = document.createElement('a');

	element.setAttribute('href', 'data:application/x-qif;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}

function countProperties(obj) {
    var l = 0;
    for (p in obj) l++;
    return l;
}
