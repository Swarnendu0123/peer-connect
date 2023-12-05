# Peer Connect

Peer Connect is a simple real-time communication application that allows users to connect with each other through video calls. This repository consists of two main folders: `server` for the backend server and `client` for the frontend application.

## Server Installation

1. Navigate to the `server` directory:

    ```bash
    cd server
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Start the server:

    ```bash
    npm start
    ```

   The server will run on `http://localhost:8000` by default. You can customize the port in the `server/index.js` file.

## Client Installation

1. Navigate to the `client` directory:

    ```bash
    cd client
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Configure the server URL:

   Open the `client/src/constants.js` file and update the `SERVER_URL` variable with the URL where your server is running.

4. Start the client application:

    ```bash
    npm start
    ```

   The client will be accessible at `http://localhost:3000` by default.

## Usage

1. Access the client application in your web browser.

2. Enter a email and click "Connect"

3. Share the generated room link with others.

4. Others can join the same room using the link.

5. Enjoy real-time video communication!

## Configuration

- Server configuration can be modified in `server/index.js`.
- Client configuration (e.g., server URL) can be modified in `client/src/constants.js`.

## Contributing

Feel free to contribute by opening issues or pull requests.
