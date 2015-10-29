<?php
function generateRegister($filename, $bank) {
	$file = openCsv($filename, $bank);

	if ($bank != "abnamro") {
	  array_shift($file);
  }
	if ($bank == "bcee") {
		array_shift($file);		
	}

	$registerQif = "!Type:Bank\n\n";
	foreach ($file as $registerCsv)
	{
		if ($registerCsv[0] != null && ($registerCsv[1] != null || $bank=="abnamro")) {
			$registerQif .= generateTransaction($registerCsv, $bank);
		}
	}	
	return $registerQif;
}

function generateTransaction($transactionCsv, $bank) {
	if ($bank == "bceeOld") $fields = bceeOld($transactionCsv);
	if ($bank == "bcee") $fields = bcee($transactionCsv);
	if ($bank == "ing") $fields = ing($transactionCsv);
	if ($bank == "rabobank") $fields = rabobank($transactionCsv);
	if ($bank == "abnamro") $fields = abnamro($transactionCsv);

	$transaction = "";
	$transaction .= "D{$fields['date']}\n";
	$transaction .= "T{$fields['amount']}\n";
	$transaction .= "P{$fields['payee']}\n";
	if ($fields['category']) $transaction .= "L{$fields['category']}\n";

	$transaction .= "^\n\n";
	return $transaction;
}

function bceeOld($row) {
	$fields['date'] = substr($row[0],5,2) . "/" . substr($row[0],8,2) . "/" . substr($row[0],0,4);
	$fields['amount'] = $row[2];
	$fields['payee'] = $row[1];
	$fields['payee'] = trim(preg_replace('/\s\s+/', ' ', $fields['payee']));
	$fields['category'] = "";

	return $fields;
}


function bcee($row) {
	$row[0] = str_replace("\0","",$row[0]);
	$row[1] = str_replace("\0","",$row[1]);
	$row[2] = str_replace("\0","",$row[2]);
	$row[3] = str_replace("\0","",$row[3]);

	$fields['date'] = $row[0];
	$fields['amount'] = str_replace(",", ".",str_replace(" ", "",str_replace("\xA0", "",$row[2]))); //this is not a space but some strange character
	
	$fields['payee'] = $row[1];
	$fields['payee'] = trim(preg_replace('/\s\s+/', ' ', $fields['payee']));
	$fields['category'] = "";

	return $fields;
}

function ing($row) {
	$fields['date'] = substr($row[0],4,2) . "/" . substr($row[0],6,2) . "/" . substr($row[0],0,4);
	$fields['amount'] = str_replace(",", ".", $row[5] == "Bij" ? $row[6] : "-".$row[6]);
	$fields['payee'] = $row[1] . " " . $row[8] . " " . $row[3];
	$fields['payee'] = trim(preg_replace('/\s\s+/', ' ', $fields['payee']));
	$fields['category'] = $row[7];

	return $fields;
}

function rabobank($row) {

        // Rabobank CSV strucure based on:
        // https://bankieren.rabobank.nl/klanten/bedrijven/help/specificaties_elektronische_betaaldiensten/rabo_internetbankieren_professional/export/ --> 'CSV (kommagescheiden nieuw)'

        $fields['date'] = substr($row[2],4,2) . "/" . substr($row[2],6,2) . "/" . substr($row[2],0,4);
        $fields['amount'] = str_replace(",", ".", $row[3] == "C" ? $row[4] : "-".$row[4]);
        $fields['payee'] = $row[5] . " " . $row[6];
        $fields['payee'] = trim(preg_replace('/\s\s+/', ' ', $fields['payee']));
        $fields['category'] = "";

        return $fields;
}

function abnamro($row) {
        // For some reason, ABN Amro csv's are doubly escaped, so we need to read the line as csv once more
        $row_new = str_getcsv($row[0]);
        $fields['date'] = substr($row_new[2],4,2) . "/" . substr($row_new[2],6,2) . "/" . substr($row_new[2],0,4);
        $fields['amount'] = $row_new[6];
        $fields['payee'] = $row_new[7];
        $fields['category'] = "";
        return $fields;
}

function openCsv($fileName, $bank) {
	if ($bank == "ing") $delimiter = ",";
	if ($bank == "bcee") $delimiter = ";";
	if ($bank == "rabobank") $delimiter = ",";
	if ($bank == "abnamro") $delimiter = ",";

	$lines = array();
	$row = 1;
	if (($handle = fopen($fileName, "r")) !== FALSE) {
	    while (($fields = fgetcsv($handle, 1000, $delimiter)) !== FALSE) {
		$lines[] = $fields;
		$row++;
	    }
	    fclose($handle);
	}
	return $lines;
}

?>
