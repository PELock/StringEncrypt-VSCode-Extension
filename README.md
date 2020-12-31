# StringEncrypt Extension for Visual Studio Code

Encrypt and hide plain text strings & files contents within your source code in a secure & encrypted form with the help of a polymorphic engine, generating random-looking decryption code every time.

https://www.stringencrypt.com

Now available as a Visual Studio Code extension.

https://marketplace.visualstudio.com/items?itemName=PELock.stringencrypt

Simple & fast encryption — try it yourself!

## What it does?

It can turn your plain text strings or file contents into a random-looking encrypted mess. Take a look.

Before:

```js
var superSecretPhrase = "Easy string encryption for developers!";
```

After StringEncrypt:

```js
// encrypted with https://www.stringencrypt.com (v1.4.0) [JavaScript]
// superSecretPhrase = "Easy string encryption for developers!"
var superSecretPhrase = "\uBF59\uC4DE\uE963\uF128\uE48D\u0172\u0917\uF2DC" +
                        "\uFB41\u0A66\u0BCB\u1CF0\u1C95\u23BA\u2B5F\u3A44" +
                        "\u5929\u430E\u6953\u5378\u623D\u63A2\u74E7\u74AC" +
                        "\u8251\u8A37\u943C\u94C1\u9CE6\u830B\uACF0\uB3D5" +
                        "\uC23A\uCA5F\uCC44\uDA69\uBB0E\uEDD3";

for (var rOnpR = 0, FiuqR = 0; rOnpR < 38; rOnpR++)
{
        FiuqR = superSecretPhrase.charCodeAt(rOnpR);
        FiuqR -= rOnpR;
        FiuqR ^= 0xFFFF;
        FiuqR += 0x82A3;
        FiuqR = ((FiuqR << 5) | ( (FiuqR & 0xFFFF) >> 11)) & 0xFFFF;
        FiuqR += 0xE87C;
        FiuqR += rOnpR;
        FiuqR -= 0x7CB9;
        FiuqR = (((FiuqR & 0xFFFF) >> 7) | (FiuqR << 9)) & 0xFFFF;
        FiuqR ^= 0x4928;
        FiuqR += rOnpR;
        FiuqR --;
        FiuqR ^= 0xFC14;
        FiuqR -= 0x406C;
        FiuqR = (((FiuqR & 0xFFFF) >> 3) | (FiuqR << 13)) & 0xFFFF;
        superSecretPhrase = superSecretPhrase.substr(0, rOnpR) + String.fromCharCode(FiuqR & 0xFFFF) + superSecretPhrase.substr(rOnpR + 1);
}
```

## How to use it in Visual Studio Code?

StringEncrypt is available as an extension to the context menu activated with a right-mouse click on the active editor window.

### 1. Insert Encrypted String

1. Open the right-click menu in the active editor window
2. Click on the **Insert Encrypted String**
3. A dialog box will ask you to enter the **string label** e.g. _encryptedStringLabel_
4. A second dialog box will ask you to enter the **string** to be encrypted e.g. _"Hello, world!"_ (enter it without the quotes)

![Insert Encrypted String Example](https://www.stringencrypt.com/images/stringencrypt-insert-encrypted-string-example.gif)

> Note: In demo mode, label and an encrypted string length is only 6 characters max.

### 2. Encrypt Selected String

1. Select **any** text in the active editor window (we recommend entering it on a new line)
2. Open the right-click menu in the active editor window
3. Click on the **Encrypt Selected String**
4. A dialog box will ask you to enter the **string label** e.g. _encryptedStringLabel_

![Encrypt Selected String Example](https://www.stringencrypt.com/images/stringencrypt-encrypt-selected-string-example.gif)

> Note: This menu option is shown only if you select a string in your active editor window.

### 3. Insert Encrypted File

1. Open the right-click menu in the active editor window
2. Click on the **Insert Encrypted File**
3. A dialog box will ask you to select a file for encryption (it can be a binary file or a text file)
4. A second dialog box will ask you to enter the **string label** e.g. _encryptedStringLabel_

![Insert Encrypted File Example](https://www.stringencrypt.com/images/stringencrypt-insert-encrypted-file-example.gif)

> Note: This option is available only in the full version.

## Say hello to polymorphic encryption!

Forget about simple `xor` encryption! StringEncrypt comes with a unique encryption engine.

It's a **polymorphic encryption engine**, similar to the encryption methods used by the software protection solutions and advanced computer viruses.

### How it works?

Let me explain how the polymorphic encryption process works.

1. A random set of encryption commands is selected (`xor`, `addition`, `subtraction`, `bit rotations`, `bit shifts`, `logical negation` etc.).
2. A random set of helper `encryption keys` is generated.
3. Every byte of the input string is encrypted with every encryption command in the random set.
4. The decryption code in the selected programming language is generated with a reverse set of encryption commands.

More about polymorphic engines:

* How to build a polymorphic engine in C++ - https://www.pelock.com/articles/polymorphic-encryption-algorithms
* Polymorphic engine in 32-bit MASM assembler - https://github.com/PELock/Simple-Polymorphic-Engine-SPE32
* Poly Polymorphic Engine - https://www.pelock.com/products/poly-polymorphic-engine

### What does it mean?

The encrypted content is **different** every time you apply StringEncrypt encryption to it.

The algorithm is always **unique**, the encryption keys are always **randomly selected** and the decryption code is also **unique** for every time you use our encryption.

## Features

* Out of box support for `UNICODE` (WideChar type in `C/C++` languages), `UTF-8` (multibyte) & `ANSI` (single byte) strings encodings
* Configurable minimum & maximum number of encryption commands
* Different ways to store the encrypted string (as a `global` or `local` variable if the selected programming language supports it)
* Wide array of supported programming languages
* You can automate encryption process in your builds using our `WebAPI` interface

## Supported programming languages

StringEncrypt engine supports code generation for the following programming languages:

* [C & C++](https://www.stringencrypt.com/c-cpp-encryption/)
* [C# (C Sharp for .NET)](https://www.stringencrypt.com/c-sharp-encryption/)
* [Visual Basic .NET (VB.NET)](https://www.stringencrypt.com/visual-basic-net-vb-net-encryption/)
* [Delphi / Pascal](https://www.stringencrypt.com/delphi-pascal-encryption/)
* [Java](https://www.stringencrypt.com/java-encryption/)
* [JavaScript](https://www.stringencrypt.com/javascript-encryption/)
* [Python](https://www.stringencrypt.com/python-encryption/)
* [Ruby](https://www.stringencrypt.com/ruby-encryption/)
* [AutoIt](https://www.stringencrypt.com/autoit-encryption/)
* [Powershell](https://www.stringencrypt.com/powershell-encryption/)
* [Haskell](https://www.stringencrypt.com/haskell-encryption/)
* [MASM assembler](https://www.stringencrypt.com/masm-encryption/)
* [FASM assembler](https://www.stringencrypt.com/fasm-encryption/)

> Note: **Visual Studio Code** might not support some of the listed languages by default, you might install the extension first to support it (e.g. for Python), but you can always use our online interface to encrypt strings for it anyway.

## Available editions

StringEncrypt can be used:

* Directly on its website - https://www.stringencrypt.com/
* You can download standalone Windows client - https://www.stringencrypt.com/download/
* You can use it via WebAPI interface (from `PHP`) - https://www.stringencrypt.com/api/
* ...and **now** also as a Visual Studio Code extension - https://marketplace.visualstudio.com/items?itemName=PELock.stringencrypt

## Extension settings

You can fine-tune encryption settings in the extension **Settings** page.

## Free demo version limitations

The free demo version comes with some **limitations**.

| Feature                               | Demo version     | Full version |
|---------------------------------------|:----------------:|-------------:|
| String encryption                     | ✅              | ✅           |
| File encryption (text or binary file) | ❌              | ✅           |
| Max. label length (characters)        | `10`             | `64`         |
| Max. string length (characters)       | `10`             | `4096`       |
| Max. file length (bytes)              | —                | `4 MB`       |
| Min. number of encryption commands    | `3`              | `50`         |
| Max. number of encryption commands    | `3`              | `50`         |


## Purchase activation code

To remove the limitations and support our project and its development, you need to buy an activation code at:

https://www.stringencrypt.com/buy/

You can enter the activation code in the extension settings page. Each activation code has an assigned number of **usage credits**. You can use the software in full version as many times as you have usage credits on your account balance.

## How to get a free activation code?

You can get a **free activation code** (500 usage credits) if you can advertise StringEncrypt service with a link to the project site https://www.stringencrypt.com/ at:

* Programming forums
* Programming blogs
* Technical articles
* Twitter / Facebook / other social media site
* ...or any other website related to programming and development

Send me all the details at my [contact address](https://www.stringencrypt.com/) and if it's legit - **bam!**, you got yourself a free code :)

## Changelog

### [1.0.1] - 2020-07-26

- Fixes missing dependencies

### [1.0.0] - 2020-07-25

- Initial release of a StringEncrypt Extension for Visual Studio Code
- Support for string encryption
- Support for file encryption