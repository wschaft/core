$(document).ready(function(){
	var params = OC.Util.History.parseUrlQuery();

	// Hack to add a trusted domain
	if (params.trustDomain) {
		OC.dialogs.confirm(t('settings', 'Are you really sure you want add "{domain}" as trusted domain?',
				{domain: params.trustDomain}),
			t('settings', 'Add trusted domain'), function(answer) {
				if(answer) {
					$.ajax({
						type: 'POST',
						url: OC.generateUrl('settings/admin/security/trustedDomains'),
						data: { newTrustedDomain: params.trustDomain }
					}).done(function() {
						window.location.replace(OC.generateUrl('settings/admin/security'));
					});
				}
			});
	}


	$('#excludedGroups').each(function (index, element) {
		OC.Settings.setupGroupsSelect($(element));
		$(element).change(function(ev) {
			var groups = ev.val || [];
			groups = JSON.stringify(groups);
			OC.AppConfig.setValue('core', $(this).attr('name'), groups);
		});
	});


	$('#loglevel').change(function(){
		$.post(OC.generateUrl('/settings/admin/log/level'), {level: $(this).val()});
	});

	$('#shareAPIEnabled').change(function() {
		$('#shareAPI p:not(#enable)').toggleClass('hidden', !this.checked);
	});

	$('#enableEncryption').change(function() {
		$('#encryptionAPI div#EncryptionWarning').toggleClass('hidden');
	});

	function selectEncryptionBehavior() {
		$('#confirm-encryption-warning').addClass("hidden");
		$('#encryptionAPI').addClass("hidden");
		$('#ocDefaultEncryptionModule').addClass("hidden");
		$('#encryptHomeStorage').removeAttr("checked",false);
	}

	function masterkeyEncryptionSelected() {
		$('#confirm-encryption-warning').removeClass("hidden");
		$('#encryptionAPI').addClass("hidden");
		$('#ocDefaultEncryptionModule').addClass("hidden");
		$('#encryptHomeStorage').removeAttr("checked", false);
		$('#enableEncryption').removeAttr("checked", false);
		$('#OC_DEFAULT_MODULE').removeAttr("checked", false);
		$('#enableEncryption').removeAttr("disabled", false);
	}

	function userSpecificEncryptionSelected() {
		$('#encryptHomeStorage').attr("checked","checked");
		$('#confirm-encryption-warning').addClass("hidden");
		$('#encryptionAPI').removeClass("hidden");
		$('#ocDefaultEncryptionModule').removeClass("hidden");
	}

	if ($('#keyTypeId :selected').val() == "nokey") {
		selectEncryptionBehavior();
	} else if ($('#keyTypeId :selected').val() == "masterkey") {
		masterkeyEncryptionSelected();
		$('#confirm-encryption-warning').addClass("hidden");
	}

	if ($('#enableEncryption').prop("checked") == true) {
		$('#keyTypeId option[value="customkey"]').attr("selected", "selected");
		$('#confirm-encryption-warning').removeClass("hidden");
		userSpecificEncryptionSelected();
	}

	$('#keyTypeId').change(function (element) {
		console.log("The value selected is = ", $('#keyTypeId option:selected').val() );
		if($('#keyTypeId :selected').val() == "nokey") {
			selectEncryptionBehavior();
		} else if ($('#keyTypeId :selected').val() == "masterkey") {
			$('#keyTypeId').removeAttr("selected");
			$('#keyTypeId :selected').attr('selected', true);
			masterkeyEncryptionSelected();
		} else  {
			userSpecificEncryptionSelected();
		}
	});

	$('#reconfirm-encryption-type').click(function (event) {
		if ($('#keyTypeId option:selected').val() == 'masterkey') {
			OC.AppConfig.setValue('encryption', 'useMasterKey', '1');
			location.reload();
		}
	});

	$('#reallyEnableEncryption').click(function() {
		$('#encryptionAPI div#EncryptionWarning').toggleClass('hidden');
		$('#encryptionAPI div#EncryptionSettingsArea').toggleClass('hidden');
		OC.AppConfig.setValue('core', 'encryption_enabled', 'yes');
		$('#enableEncryption').attr('disabled', 'disabled');
	});

	$('#startmigration').click(function(event){
		$(window).on('beforeunload.encryption', function(e) {
			return t('settings', 'Migration in progress. Please wait until the migration is finished');
		});
		event.preventDefault();
		$('#startmigration').prop('disabled', true);
		OC.msg.startAction('#startmigration_msg', t('settings', 'Migration started …'));
		$.post(OC.generateUrl('/settings/admin/startmigration'), '', function(data){
			OC.msg.finishedAction('#startmigration_msg', data);
			if (data['status'] === 'success') {
				$('#encryptionAPI div#selectEncryptionModules').toggleClass('hidden');
				$('#encryptionAPI div#migrationWarning').toggleClass('hidden');
			} else {
				$('#startmigration').prop('disabled', false);
			}
			$(window).off('beforeunload.encryption');

		});
	});

	$('#shareapiExpireAfterNDays').change(function() {
		var value = $(this).val();
		if (value <= 0) {
			$(this).val("1");
		}
	});

	$('#shareAPI input:not(#excludedGroups)').change(function() {
		var value = $(this).val();
		if ($(this).attr('type') === 'checkbox') {
			if (this.checked) {
				value = 'yes';
			} else {
				value = 'no';
			}
		}
		OC.AppConfig.setValue('core', $(this).attr('name'), value);
	});

	$('#shareapiDefaultExpireDate').change(function() {
		$("#setDefaultExpireDate").toggleClass('hidden', !this.checked);
	});

	$('#allowLinks').change(function() {
		$("#publicLinkSettings").toggleClass('hidden', !this.checked);
		$('#setDefaultExpireDate').toggleClass('hidden', !(this.checked && $('#shareapiDefaultExpireDate')[0].checked));
	});


	$('#allowGroupSharing').change(function() {
		$('#allowGroupSharing').toggleClass('hidden', !this.checked);
	});

	$('#shareapiExcludeGroups').change(function() {
		$("#selectExcludedGroups").toggleClass('hidden', !this.checked);
	});


});
