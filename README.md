# nodejs_express_password_less_verification_code_231212

## Password-less authentication - Node JS & Mongo DB https://www.youtube.com/watch?v=gFJ_vhodATY

- Generate key pair: https://github.com/vochinguyen/nodejs_crypto_basic_231206

- jsonwebtoken https://www.npmjs.com/package/jsonwebtoken:

   + Adding User Login & JWT Signing | Creating a REST API with Node.js https://www.youtube.com/watch?v=0D5EEKH97NA&list=PL55RiY5tL51q4D-B63KBnygU6opNPFk_q&index=12
    ```
        const privateKey = fs.readFileSync("jwt_private.key");
        const token = jwt.sign({ email }, privateKey, {
        algorithm: "RS256",
        expiresIn: "5m",
        });
    ```
   + JWT Route Protection | Creating a REST API with Node.js https://www.youtube.com/watch?v=8Ip0pcwbWYM&list=PL55RiY5tL51q4D-B63KBnygU6opNPFk_q&index=13
    ```
        function verifyToken(req, res, next) {
            try {
                const bearerToken = req.headers.authorization;
                const token = bearerToken.split(" ")[1];
                const publicKey = fs.readFileSync("jwt_public.key"); //Generate key pair https://github.com/vochinguyen/nodejs_crypto_basic_231206
                const decoded = jwt.verify(token, publicKey);
                req.userData = decoded;
                next();
            } catch (error) {
                return res.status(401).json({
                message: "Auth failed",
                });
            }
        }
    ```
    ```
        POST http://localhost:3000/protected HTTP/1.1
        Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImNoaW5ndXllbl90ZXN...

    ```
