<?php
$oldFileName = $_FILES['csv']['name'];
$bank = $_POST['bank'];

if (substr($oldFileName,-4) != '.csv') { $error = "Filename should end in .csv!"; }
if (!($bank == "ing" || $bank == "bcee" || $bank == "bceeOld" || $bank == "rabobank")) { $error = "Choose a bank!"; }

if ($error) {
	echo $error;
	exit;
}

$newFileName = substr($oldFileName,0,strlen($oldFileName) - 4) . ".qif";

header("Content-disposition: attachment; filename=$newFileName");
header("Content-type: application/x-qif");

include('run.php');

$filename = $_FILES['csv']['tmp_name'];

echo generateRegister($filename, $bank);

unlink($filename);
?>
