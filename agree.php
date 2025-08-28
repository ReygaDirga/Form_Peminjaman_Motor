<?php
session_start();
$_SESSION['agreed'] = true;
header("Location: form.php");
exit();
?>
