import React, { Component } from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import { Button, FormControl, Container, Row } from "react-bootstrap";
import Image from 'react-bootstrap/Image'
import NoxLogo from '../images/noxLogo.png'
import axios from 'axios';
import io from 'socket.io-client';
import { callbackify } from 'util';

// Establish socket connection
// Connecting to the server from clients end
let socket;
if (!socket) {
    socket = io('http://localhost:5000');
}
console.log('THIS IS CLIENT SOCKET INFO: ', socket);



axios.defaults.withCredentials = true

export default class LandingPage extends Component {
    constructor(props) {
        super(props);
        this.codeBox = React.createRef();


        // Binding our custom functions to .this
        this.state = {
            placeholderValue: "Session Code",
            showComponent: false,
            code: '',
            borderColor: 'black',
            showError: false
        };
        this._onButtonClick = this._onButtonClick.bind(this);
        this.onJoinSession = this.onJoinSession.bind(this);


        // Recieve a msg 
        //this.sendSocketIO = this.sendSocketIO.bind(this);


        // On recieves a msg 
        // Any event is created, takes in the data server has sent, 
        // This.setState updates ur code on front end.
        // This is the profs page implentation
        // Profs need it. 

        socket.on("someEvent", (JsonParameters) => {
            // Sets the front end state end to w.e the new values 
            this.setState({
                placeholderValue: JsonParameters.newCode
            });

            console.log("SOCKET FUNCTION WENT THROUGH TO PROF CLIENT ", JsonParameters.newCode);
            console.log(JsonParameters);
        });

    }

    // Socket Function


    // Enter Button clicked
    // To do: check if empty code
    _onButtonClick() {
        this.setState({
            showComponent: true,
        });

    }

    onJoinSession(codeValue) {
        codeValue.preventDefault();


        this.setState({
            code: this.codeBox.current.value
        });


        const joinSession = {
            sesid: this.codeBox.current.value,
            socketID: socket.id
        }
        console.log(joinSession)



        // Attempt to join a live session
        axios.post("http://localhost:5000/api/sessions/JoinSession", joinSession).then(res => {
            //console.log(res);
            //console.log(res.data['success']);
            this.setState({
                borderColor: res.data['success'] ? 'green' : 'red',
                showError: res.data['success'] ? false : true
            })
            const path = '/Student';
            this.props.history.push(path);
        }).catch((error, res) => { // Happens if Session not found
            console.log(this.state.borderColor);
            console.log(error);
            this.setState({
                borderColor: error.status === 304 ? 'black' : 'red',
                showError: error.status === 304 ? false : true
            });
        });




        // send data via socket
        // this.sendSocketIO();



    }

    render() {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '65vh' }}>
                <Container style={{ width: 300 }}>
                    {this.state.showError && <div style={{
                        backgroundColor: '#ff7272', color: 'white', padding: '1em',
                        position: 'relative', width: 300, top: '-20px', left: '-15px'
                    }}

                    >Invalid Session Code</div>}
                    <Row className="show-grid">

                        <div style={{ position: 'relative', right: 50 }}>
                            <Image src={NoxLogo} alt='Nox Logo' />
                        </div>

                        <InputGroup >
                            <FormControl style={{ borderColor: this.state.borderColor }}
                                ref={this.codeBox}
                                placeholder={this.state.placeholderValue}
                                aria-label={this.state.placeholderValue}
                                aria-describedby="basic-addon2"
                            />
                        </InputGroup>
                        <Button style={{ width: 300 }} variant="dark" onClick={this.onJoinSession}>Enter</Button>
                    </Row>
                </Container>
            </div>
        );
    }
}