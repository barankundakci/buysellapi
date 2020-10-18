http://localhost:3000/hisse/buy Get methodu
Parametreleri:
*symbol Hissenin 3 harflık sembolu
*share Ne kadar hisse alınacağı
*userId hangi payloadlı hesabın alacağı

Örnek kullanım: http://localhost:3000/hisse/buy?symbol=HSM&share=1.2&userId=1

http://localhost:3000/hisse/sell Get methodu
*symbol Hissenin 3 harflık sembolu
*share Ne kadar hisse alınacağı
*userId hangi payloadlı hesabın alacağı

Örnek kullanım: http://localhost:3000/hisse/sell?symbol=HSM&share=1.2&userId=1

http://localhost:3000/hisse/getAll Get methodu tüm hisseleri çekiyor.

http://localhost:3000/hisse/ Post method
*symbol Hissenin 3 harflık sembolu
*price Hissenin birim fiyatının kaçtan satılacağı
*hisseAdi hissenin detaylı adı

Örnek kullanım;
POST /hisse/ HTTP/1.1
Host: localhost:3000
Content-Type: application/x-www-form-urlencoded
Cache-Control: no-cache
Postman-Token: bf69a377-074c-3da7-25de-5e17786ccef4

symbol=GMA&price=132.17&hisseAdi=General+Motor+Automatics