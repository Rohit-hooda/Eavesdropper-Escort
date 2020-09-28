async function keyGen() {
  var name = document.getElementById("name").value;
  var email = document.getElementById("email").value;
  var passphrase = document.getElementById("passphrase").value;
  //TODO 
  // Remove the static values from the generatekey.html. 

  const {
    privateKeyArmored,
    publicKeyArmored,
    revocationCertificate,
  } = await openpgp.generateKey({
    userIds: [{ name: name, email: email }], // you can pass multiple user IDs
    curve: "ed25519", // ECC curve name
    passphrase: passphrase, // protects the private key
  });

  var keys = {
    private_key: privateKeyArmored,
    public_key: publicKeyArmored,
    certificate: revocationCertificate,
  };
  displaykey(keys);
}

function displaykey(keys) {
  if (keys) {
    var submitButton = document.getElementById("submit");
    document.getElementById("generated-keys-div").style.display = "block";
    document.getElementById("generated-private-key-textarea").value =
      keys.private_key;
    document.getElementById("generated-public-key-textarea").value =
      keys.public_key;
    submitButton.value = "Generate Fresh Keys";
    submitButton.disabled = false;
  }
}

async function encryptText() {
  var publicKeyArmored = document.getElementById('public-key-textarea').value;
  var privateKeyArmored = document.getElementById('private-key-textarea').value;
  var passphrase = document.getElementById('private-key-passphrase').value;
  var message = document.getElementById('text').value;
  var submit = document.getElementById('encrypt-button');
  
  submit.innerHTML = "Encrypting.. This may take a while.";
  submit.disabled = true;
  
  if(!publicKeyArmored  || !text){
    alert("Please enter the public key and message");
    submit.innerHTML = "Encrypt and Download";
    submit.disabled = false;
    return;
  }
  var decrypted_privatekey;
  if (privateKeyArmored) {
    const {keys:[privateKey]} = await openpgp.key.readArmored(privateKeyArmored);
    await privateKey.decrypt(passphrase);
    decrypted_privatekey = [privateKey];
  }

  const { data: encrypted } = await openpgp.encrypt({
      message: openpgp.message.fromText(message),                 // input as Message object
      publicKeys: (await openpgp.key.readArmored(publicKeyArmored)).keys, // for encryption
      privateKeys: privateKeyArmored ? decrypted_privatekey : undefined     // for signing (optional)
  });    
  console.log(encrypted); // '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----'

  submit.innerHTML = "Encrypt and Download";
  submit.disabled = false;
}

async function decryptText() {
  var privateKeyArmored = document.getElementById("private-key-textarea").value;
  var passphrase = document.getElementById("private-key-passphrase").value;
  var messageToDecrypt = document.getElementById("encrypted-message").value;
  var text_display = document.getElementById("text-data");
  var publicKeyArmored = document.getElementById("public-key-textarea").value;
  var submit = document.getElementById("decrypt-button");

  submit.innerHTML = "Decrypting.. This may take a while.";
  submit.disabled = true;

  if(!privateKeyArmored || !passphrase || !messageToDecrypt){
    alert("Please enter the required fields");
    submit.innerHTML = "Decrypt";
    submit.disabled = false;
  }

  const { keys: [privateKey] } = await openpgp.key.readArmored(privateKeyArmored);
  await privateKey.decrypt(passphrase);

  const { data: decrypted } = await openpgp.decrypt({
      message: await openpgp.message.readArmored(messageToDecrypt),              // parse armored message
      publicKeys: publicKeyArmored ? (await openpgp.key.readArmored(publicKeyArmored)).keys: undefined, // for verification (optional)
      privateKeys: [privateKey]                                           // for decryption
  });
  console.log(decrypted); // 'Hello, World!'}
  text_display.style.display = "";

  submit.innerHTML = "Decrypt";
  submit.disabled = false;
}

