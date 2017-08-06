<?php
$oldFileName = $_FILES['csv']['name'];
$bank = $_POST['bank'];
$error = '';

if (substr($oldFileName,-4) != '.csv') { $error = "Filename should end in .csv!"; }
if (!($bank == "abnamro" || $bank == "ing" || $bank == "rabobank" || $bank == "bcee" || $bank == "bceeOld" || $bank == "seb")) { $error = "Choose a bank!"; }

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
