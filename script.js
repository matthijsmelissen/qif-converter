window.onload = function() {
	var fileInput = document.getElementById('file-input');
	var form = document.getElementById('form');

	form.addEventListener('submit', function(e) {
		e.preventDefault();
		var file = fileInput.files[0];

		if (file.type = 'text/csv') {
			var reader = new FileReader();

			reader.onload = function(e) {
				output = convertRegister(reader.result, document.getElementById('bank').value);
				newFileName = file.name.replace('.csv','')+'.qif';
				download(output, newFileName);
			}

			reader.readAsText(file);	
		} else {
			alert('File not supported!');
		}
	});
}

function parseCsv(file, bank) {
	var delimiter;

	if (bank == 'ing') delimiter = ',';
	if (bank == 'bcee') delimiter = ';';
	if (bank == 'rabobank') delimiter = ',';
	if (bank == 'abnamro') delimiter = ',';
	if (bank == 'seb') delimiter = ';';

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

		if (countProperties(transactionCsv) >= 3) {
			registerQif += convertTransaction(transactionCsv, bank);
		}
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

	var transaction = '';
	transaction += 'D' + fields['date'] + '\n';
	transaction += 'T' + fields['amount'] + '\n';
	transaction += 'P' + fields['payee'] + '\n';
	if (fields['category']) transaction += 'L' + fields['category'] + '\n';

	transaction += '^\n\n';
	return transaction;
}


function bcee(row) {
	row[0] = row[0].replace('\0','');
	row[1] = row[1].replace('\0','');
	row[2] = row[2].replace('\0','');
	row[3] = row[3].replace('\0','');

	var fields = {};

	fields['date'] = row[0];
	fields['amount'] = row[2].replace('\xA0', '').replace(' ', '').replace(',', '.'); //this is not a space but some strange character

	fields['payee'] = row[1];
	fields['payee'] = fields['payee'].replace(/\s\s+/g, ' ').trim();
	fields['category'] = '';

	return fields;
}

function ing(row) {
	var fields = {};
	fields['date'] = row['Datum'].substr(4,2) + '/' + row['Datum'].substr(6,2) + '/' + row['Datum'].substr(0,4);
	fields['amount'] = ((row['Af Bij'] == 'Af' ? '-' : '') + row['Bedrag (EUR)']).replace(',', '.');
	fields['payee'] = row['Naam / Omschrijving'] + ' ' + row['Mededelingen'] + ' ' + row['Tegenrekening'];
	fields['payee'] = fields['payee'].replace(/\s\s+/g, ' ').trim();
	fields['category'] = row['MutatieSoort'];

	return fields;
}

function rabobank(row) {
    // Rabobank CSV strucure based on:
    // https://bankieren.rabobank.nl/klanten/bedrijven/help/specificaties_elektronische_betaaldiensten/rabo_internetbankieren_professional/export/ --> 'CSV (kommagescheiden nieuw)'

    var fields = {};
    fields['date'] = row[2].substr(4,2) + '/' + row[2].substr(6,2) + '/' + row[2].substr(0,4);
    fields['amount'] = (row[3] == 'C' ? row[4] : '-'+row[4]).replace(',', '.');
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

function seb($row) {
    $fields['date'] = row[0].substr(5,2) + "/" + row[0].substr(8,2) + "/" + row[0].substr(0,4);
    $fields['amount'] = row[4].replace(',','.');
    $fields['payee'] = row[3];
    $fields['category'] = '';
    return $fields;
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
