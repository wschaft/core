<?php
/**
 * @author Björn Schießle <bjoern@schiessle.org>
 * @author Georg Ehrke <georg@owncloud.com>
 * @author Joas Schilling <coding@schilljs.com>
 * @author Thomas Müller <thomas.mueller@tmit.eu>
 *
 * @copyright Copyright (c) 2016, ownCloud GmbH.
 * @license AGPL-3.0
 *
 * This code is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License, version 3,
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License, version 3,
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 *
 */
namespace OCA\DAV\AppInfo;

use OCA\DAV\CalDAV\BirthdayService;
use OCA\DAV\CardDAV\ContactsManager;
use OCA\DAV\CardDAV\SyncService;
use OCA\DAV\HookManager;
use \OCP\AppFramework\App;
use OCP\Contacts\IManager;
use Symfony\Component\EventDispatcher\GenericEvent;

class Application extends App {

	/**
	 * Application constructor.
	 *
	 * @param array $urlParams
	 */
	public function __construct (array $urlParams= []) {
		parent::__construct('dav', $urlParams);
	}

	/**
	 * @param IManager $contactsManager
	 * @param string $userID
	 */
	public function setupContactsProvider(IManager $contactsManager, $userID) {
		/** @var ContactsManager $cm */
		$cm = $this->getContainer()->query(ContactsManager::class);
		$urlGenerator = $this->getContainer()->getServer()->getURLGenerator();
		$cm->setupContactsProvider($contactsManager, $userID, $urlGenerator);
	}

	public function registerHooks() {
		/** @var HookManager $hm */
		$hm = $this->getContainer()->query(HookManager::class);
		$hm->setup();

		$listener = function($event) {
			if ($event instanceof GenericEvent) {
				/** @var BirthdayService $b */
				$b = $this->getContainer()->query(BirthdayService::class);
				$b->onCardChanged(
					$event->getArgument('addressBookId'),
					$event->getArgument('cardUri'),
					$event->getArgument('cardData')
				);
			}
		};

		$dispatcher = $this->getContainer()->getServer()->getEventDispatcher();
		$dispatcher->addListener('\OCA\DAV\CardDAV\CardDavBackend::createCard', $listener);
		$dispatcher->addListener('\OCA\DAV\CardDAV\CardDavBackend::updateCard', $listener);
		$dispatcher->addListener('\OCA\DAV\CardDAV\CardDavBackend::deleteCard', function($event) {
			if ($event instanceof GenericEvent) {
				/** @var BirthdayService $b */
				$b = $this->getContainer()->query(BirthdayService::class);
				$b->onCardDeleted(
					$event->getArgument('addressBookId'),
					$event->getArgument('cardUri')
				);
			}
		});
	}

	public function getSyncService() {
		return $this->getContainer()->query(SyncService::class);
	}

}
