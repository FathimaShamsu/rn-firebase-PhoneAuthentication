import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
  BackHandler
} from "react-native";
import PhoneInput from "react-native-phone-input";
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import { UIActivityIndicator } from 'react-native-indicators';
import CountDown from "react-native-countdown-component";
export default class newCode extends Component {
  constructor() {
    super();
    this.state = {
      confirmResult: null,
      verificationCode: "",
      phones: "",
      spinnerValue: false
    };
  }
  componentDidMount() {
    this.setState({
      phones: this.props.navigation.getParam("phone"),
      confirmResult: this.props.navigation.getParam('confirmResult'),
    });
    this.backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      this.handleBackPress
    );
  }

  componentWillUnmount() {
    this.backHandler.remove();
  }

  handleBackPress = () => {
    return true;
  };
  // Request to send OTP
  handleSendCode = () => {
    firebase
      .auth()
      .signInWithPhoneNumber(this.state.phones)
      .then(confirmResult => {
        this.setState(
          { confirmResult, spinnerValue: false, verificationCode: "" },
          () => {
            this.props.navigation.navigate("verification");
          }
        );
      })
      .catch(error => {
        alert(error.message);
        this.setState({ spinnerValue: false });
        console.log(error);
      });
    this.setState({ confirmResult: null, verificationCode: "" });
  };
  resend = () => {
    setTimeout(() => {
      this.setState({ spinnerValue: true });
      this.handleSendCode();
    }, 30);
  };
  render() {
    return (
      <View style={styles.container}>
        <Text style={[styles.text1]}>Verify your Mobile Number</Text>
        <Text style={[styles.numberStyle]}>{this.state.phones}</Text>
        <TouchableOpacity
          style={[styles.themeButton1]}
          onPress={() => {
            this.setState({ spinnerValue: true });
            this.props.navigation.navigate("app");
          }}
        >
          <Text style={[styles.text2]}>Change Phone Number</Text>
        </TouchableOpacity>
        <View style={[styles.themeButton2]}>
          <CountDown
            until={60}
            size={20}
            style={[styles.countDown]}
            timeLabelStyle={[styles.timeLabelStyle]}
            digitStyle={[styles.digitStyle]}
            digitTxtStyle={[styles.digitTxtStyle]}
            timeToShow={["S"]}
            timeLabels={{ m: null, s: "Tap here to Resend Code " }}
            onPress={() => {
              this.setState({ spinnerValue: true });
              this.handleSendCode();
            }}
            onFinish={() => {
              Alert.alert("Time Out");
              this.props.navigation.navigate("app");
            }}
          />
        </View>
        {this.state.spinnerValue === true ? (
          <View style={[styles.loading]}>
            <UIActivityIndicator color="#b0c4de" />
            <Text style={[styles.loadingText]}>Please Wait . . . .</Text>
          </View>
        ) : null}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    // flexDirection: "row",
  },
  themeButton1: {
    marginTop: 20,
    width: '80%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#b0c4de',
    borderColor: "#b0c4de",
    borderWidth: 2,
    borderRadius: 1,
  },
  themeButton2: {
    width: '80%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderColor: "#b0c4de",
    borderWidth: 2,
    borderRadius: 1,
    marginTop: 20
  },
  numberStyle: {
    color: '#4682b4',
    fontSize: 16,
  },
  text1: {
    color: '#696969',
    fontSize: 16
  },
  text2: {
    fontSize: 17,
    color: 'white',
  },
  countDown: {
    backgroundColor: 'transparent',
    padding: 3,
  },
  timeLabelStyle: {
    color: '#b0c4de',
    fontSize: 17,
    marginTop: -30,
  },
  digitStyle: {
    backgroundColor: "transparent"
  },
  digitTxtStyle: {
    color: "#b0c4de",
    marginTop: -20
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: "#b0c4de"
  },
});
