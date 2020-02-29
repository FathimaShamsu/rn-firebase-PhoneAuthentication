import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Keyboard
} from 'react-native';
import { NavigationEvents } from 'react-navigation';
import { UIActivityIndicator } from "react-native-indicators";
import OTPTextView from 'react-native-otp-textinput';
import PhoneInput from 'react-native-phone-input';
import firebase from "@react-native-firebase/app";
import auth from "@react-native-firebase/auth";

export default class App extends Component {
  constructor() {
    super();

    this.state = {
      phones: "",
      phone: '',
      confirmResult: null,
      valid: '',
      type: '',
      value: '',
      userId: "",
      code: "",
      spinnerValue: false,
      verificationCode: '',
      confirmation: ""
    };
  }
  componentDidMount = () => {
    this.setState({
      phones: this.props.navigation.getParam("phone"),
      confirmResult: this.props.navigation.getParam("confirmResult")
    });
  };

  // Request for OTP verification
  handleVerifyCode = () => {
    const { confirmResult, verificationCode } = this.state;
    if (verificationCode.length === 6) {
      confirmResult
        .confirm(verificationCode)
        .then(user => {
          this.setState({ userId: user.uid, spinnerValue: false });
          Alert.alert("OTP Verified!");
        })
        .catch(error => {
          console.log("verify page error", error);
          Alert.alert("Invalid OTP");
          this.setState({ spinnerValue: false });
        });
    } else {
      alert("Please Enter a 6 digit OTP code.");
      this.setState({ spinnerValue: false });
    }
    Keyboard.dismiss();
  };

  renderConfirmationCodeView = () => {
    return (
      <View style={styles.verificationView}>
        <OTPTextView
          containerStyle={styles.textInputContainer}
          handleTextChange={verificationCode1 =>
            this.setState({ verificationCode: verificationCode1 })
          }
          textInputStyle={styles.roundedTextInput}
          inputCount={6}
          cellTextLength={1}
          tintColor="#b0c4de"
          keyboardType="numeric"
        />
        <TouchableOpacity
          disabled={this.state.spinnerValue}
          style={[styles.themeButton]}
          onPress={() => {
            this.setState({ spinnerValue: true });
            this.handleVerifyCode();
          }}
        >
          <Text style={[styles.buttonText1]}>Continue</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.themeButton2]}
          onPress={() => {
            this.setState({ verificationCode: '' }, () => {
              this.props.navigation.navigate("newcode", {
                phone: this.state.phones,
                confirmResult: this.state.confirmResult,
              });
            });
          }}
        >
          <Text style={[styles.buttonText2]}>I didn't get a Code</Text>
        </TouchableOpacity>
        {this.state.spinnerValue === true ? (
          <View style={[styles.spinnerStyle]}>
            <UIActivityIndicator color="#b0c4de" />
            <Text style={[styles.loadingText]}>verifying</Text>
          </View>
        ) : null}
      </View>
    );
  };
  initialFunction = () => {
    this.setState({ verificationCode: "" });
  };
  render() {
    return (
      <View style={styles.container}>
        <NavigationEvents onDidFocus={() => this.initialFunction()} />
        <View style={[styles.page]}>
          <Text style={[styles.headingText]}>Enter the code was send to</Text>
          <Text style={[styles.numberText]}>{this.state.phones}</Text>
        </View>
        {this.renderConfirmationCodeView()}
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
  page: {
    height: '7%',
    justifyContent: 'center',
  },
  headingText: {
    // color: '#2f4f4',
    color: "#b0c4de",
    fontSize: 18
  },
  numberText: {
    fontSize: 17,
    color: '#4682b4',
    marginLeft: "8%"
  },
  roundedTextInput: {
    borderRadius: 5,
    borderWidth: 3,
    height: 35,
    width: '11%',
    fontSize: 17,
    padding: 1,
    textAlign: 'center'
  },
  verificationView: {
    width: '100%',
    alignItems: 'center',
    marginTop: 50,
  },
  themeButton: {
    width: '80%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#b0c4de',
    borderColor: "#b0c4de",
    borderWidth: 2,
    borderRadius: 1,
    marginTop: 20,
  },
  themeButton2: {
    width: '80%',
    marginTop: 20,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderColor: "#b0c4de",
    borderWidth: 2,
    borderRadius: 1
  },
  button: {
    marginTop: 20,
    padding: 10,
  },
  spinnerStyle: {
    flex: 1,
    marginTop: 50,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  buttonText1: {
    fontSize: 18,
    color: "white"
  },
  buttonText2: {
    fontSize: 18,
    color: '#b0c4de',
  },
  loadingText: {
    fontSize: 18,
    color: '#b0c4de',
  }
});
