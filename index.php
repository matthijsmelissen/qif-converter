<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<link rel="stylesheet" media="screen" type="text/css" href="style.css" />
<title>Conversion from CSV to QIF</title>
</head>
<body>

<h1>Conversion from CSV to QIF</h1>

This page helps importing financial data into bookkeeping software. To be more precise, it converts CSV-files (which you can obtain by downloading your financial data from your bank's website) to QIF-files, which can be imported into bookkeeping software.

<p>Currently it works for the following banks:</p>
<ul>
<li>ING (Nederland)</li>
<li>Rabobank (Nederland)</li>
<li>Spuerkees / BCEE (Banque et Caisse d'Epargne de l'Etat) (Luxembourg) Note: use BCSS (old) for files generated before July 2012.</li>
</ul>

<p>The resulting QIF files are suitable for import in GnuCash and Microsoft Money, amongst others.</p>

<p>In July 2012, BCEE changed their file format. For files generated before that date, please select 'BCEE (old)'.</p>

<form method="post" enctype="multipart/form-data" action="convert.php">
<table>
<tr><label><td>Upload CSV</td><td><input type="file" name="csv" /></label></td></tr>
<tr><label><td>Bank</td><td><select name="bank"><option value="ing">ING</option><option value="rabobank">Rabobank</option><option value="bcee">BCEE</option><option value="bceeOld">BCEE (old)</option></select></label></td></tr>
<tr><td>&nbsp;</td><td><input type="submit" value="Submit"></td></tr>
</table>
</form>

<p>This tool is still in testing phase. Please check manually if the file has been converted correctly. If you find a problem or have any further questions, please contact me at <a href="mailto:qif&#64;matthijsmelissen.nl">qif&#64;matthijsmelissen.nl</a>.</p>

<p>This tool is written by Matthijs Melissen and published under a <a href="http://creativecommons.org/publicdomain/zero/1.0/">CC-0</a> license.
Download the <a href="https://github.com/math1985/qif-converter">source code on Github</a>.</p>

</body>
</html>
