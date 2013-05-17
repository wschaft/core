<?php

require_once 'google-api-php-client/src/Google_Client.php';

OCP\JSON::checkAppEnabled('files_external');
OCP\JSON::checkLoggedIn();
OCP\JSON::callCheck();

if (isset($_POST['client_id']) && isset($_POST['client_secret']) && isset($_POST['redirect'])) {
	$client = new Google_Client();
	$client->setClientId($_POST['client_id']);
	$client->setClientSecret($_POST['client_secret']);
	$client->setRedirectUri($_POST['redirect']);
	$client->setScopes(array('https://www.googleapis.com/auth/drive'));
	if (isset($_POST['step'])) {
		$step = $_POST['step'];
		if ($step == 1) {
			try {
				$authUrl = $client->createAuthUrl();
				OCP\JSON::success(array('data' => array(
					'url' => $authUrl
				)));
			} catch (Exception $exception) {
				OCP\JSON::error(array('data' => array(
					'message' => 'Step 1 failed. Exception: '.$exception->getMessage()
				)));
			}
		} else if ($step == 2 && isset($_POST['code'])) {
			try {
				$token = $client->authenticate($_POST['code']);
				OCP\JSON::success(array('data' => array(
					'token' => $token
				)));
			} catch (Exception $exception) {
				OCP\JSON::error(array('data' => array(
					'message' => 'Step 2 failed. Exception: '.$exception->getMessage()
				)));
			}
		}
	}
}