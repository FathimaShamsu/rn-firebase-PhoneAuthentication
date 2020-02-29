import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
  Modal,
  FlatList,
  Keyboard,
  TouchableWithoutFeedback
} from "react-native";
import { UIActivityIndicator } from "react-native-indicators";
import PhoneInput from 'react-native-phone-input';
import firebase from "@react-native-firebase/app";
import data from './countries';
import auth from "@react-native-firebase/auth";
const defaultFlag = data.filter(obj => obj.name === "India")[0].flag;
const defaultCode = data.filter(obj => obj.name === "India")[0].dial_code;

export default class App extends Component {
  constructor() {
    super();
    this.unsubscribe = null;
    this.state = {
      phone: '',
      flag: defaultFlag,
      modalVisible: false,
      message: "",
      codeInput: "",
      phoneNumber: defaultCode,
      confirmResult: null,
      spinnerValue: false,
      phoneAuthSnapshot: "",
    };
  }

  async getCountry(country) {
    const countryData = await data;
    try {
      const countryCode = await countryData.filter(
        obj => obj.name === country
      )[0].dial_code;
      const countryFlag = await countryData.filter(
        obj => obj.name === country
      )[0].flag;
      this.setState({ phoneNumber: countryCode, flag: countryFlag });
      await this.hideModal();
    } catch (err) {
      console.log(err);
    }
  }
  showModal() {
    this.setState({ modalVisible: true }, () => {
      {
        this.state.flag;
      }
    });
  }
  hideModal() {
    this.setState({ modalVisible: false });
  }
  initialValidation = () => {
    if (
      this.state.phoneNumber === "" ||
      this.state.phoneNumber === null ||
      this.state.phoneNumber === undefined
    ) {
      Alert.alert('Enter phone number');
    } else {
      this.setState({ spinnerValue: true }, () => {
        this.handleSendCode();
      });
    }
    Keyboard.dismiss();
  };
  validatePhoneNumber = () => {
    var regexp = /^\+[0-9]?()[0-9](\s|\S)(\d[0-9]{8,16})$/;
    return regexp.test(this.state.phoneNumber);
  };

  // Request to send OTP
  handleSendCode = () => {
    if (this.validatePhoneNumber()) {
      firebase
        .auth()
        .verifyPhoneNumber(this.state.phoneNumber)
        .on(
          "state_changed",
          phoneAuthSnapshot => {
            switch (phoneAuthSnapshot.state) {
              case firebase.auth.PhoneAuthState.CODE_SENT: // or 'sent'
                break;
              case firebase.auth.PhoneAuthState.ERROR: // or 'error'
                Alert.alert(phoneAuthSnapshot.error.nativeErrorMessage);
                this.setState({
                  spinnerValue: false,
                });
                console.log(phoneAuthSnapshot.error);
                break;
              case firebase.auth.PhoneAuthState.AUTO_VERIFY_TIMEOUT: // or 'timeout'
                this.verifyByOtp();
                // console.log("phoneAuthSnapshot time out", phoneAuthSnapshot);
                break;
              case firebase.auth.PhoneAuthState.AUTO_VERIFIED: // or 'verified'
                Alert.alert("verified");
                this.setState({ spinnerValue: false });
                break;
            }
          },
          error => {
            console.log(error.verificationId);
          },
          phoneAuthSnapshot => {
            console.log(phoneAuthSnapshot);
          }
        );
    } else {
      alert("Invalid Phone Number"), this.setState({ spinnerValue: false });
    }
    this.setState({ phoneAuthSnapshot: null, verificationCode: "" });
  };
  verifyByOtp = () => {
    firebase
      .auth()
      .signInWithPhoneNumber(this.state.phoneNumber)
      .then(confirmResult => {
        this.setState({ confirmResult, spinnerValue: false }, () => {
          this.navigationFunction();
        });
      })
      .catch(error => {
        alert(error.message);
        console.log("numbr error", error);
        this.setState({ spinnerValue: false });
        console.log(error);
      });
  };
  navigationFunction = () => {
    this.props.navigation.navigate('verification', {
      phone: this.state.phoneNumber,
      confirmResult: this.state.confirmResult,
      confirmation: this.confirmation,
      phoneAuthSnapshot: this.state.phoneAuthSnapshot
    });
  };
  changePhoneNumber = () => {
    this.initialValidation();
  };
  render() {
    const countryData = data;
    return (
      <View style={styles.container}>
        <View style={[styles.page]}>
          <Text style={[styles.headingText]}>Enter your Mobile Number</Text>
        </View>

        <View>
          <PhoneInput
            style={styles.textInput1}
            ref={ref => {
              this.phone = ref;
            }}
            onPressFlag={() => {
              this.showModal();
            }}
            onChangePhoneNumber={val => {
              this.setState({ phoneNumber: val });
            }}
            value={this.state.phoneNumber}
            textProps={{
              placeholder: 'Phone Number with country code',
            }}
            initialCountry={'in'}
          />
          <Modal
            animationType="slide" // fade
            transparent
            visible={this.state.modalVisible}
          >
            <View style={[styles.flatlistView]}>
              <View style={[styles.flatlistStyle]}>
                <FlatList
                  data={countryData}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <TouchableWithoutFeedback
                      onPress={() => this.getCountry(item.name)}
                    >
                      <View style={[styles.countryList]}>
                        <Text style={[styles.flag]}>{item.flag}</Text>
                        <Text style={[styles.countryStyle]}>
                          {item.name} ({item.dial_code})
                        </Text>
                      </View>
                    </TouchableWithoutFeedback>
                  )}
                />
              </View>
              <TouchableOpacity
                onPress={() => this.hideModal()}
                style={styles.closeButtonStyle}
              >
                <Text style={styles.textStyle}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>
        <TouchableOpacity
          disabled={this.state.spinnerValue}
          style={[styles.themeButton]}
          onPress={() => this.initialValidation()}
        >
          <Text style={[styles.buttontext]}>
            {this.state.phoneAuthSnapshot ? 'Change Phone Number' : 'Use SMS'}
          </Text>
        </TouchableOpacity>
        {this.state.spinnerValue === true ? (
          <View style={[styles.spinnerStyle]}>
            <UIActivityIndicator color="#b0c4de" />
            <Text style={[styles.loadingText]}>Please Wait . . . .</Text>
          </View>
        ) : null}
      </View>
    );
  }
}

let styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    // flexDirection: "row",
  },
  page: {
    height: "10%"
  },
  headingText: {
    fontSize: 17,
    color: '#808080',
  },
  themeButton: {
    marginTop: 20,
    width: '90%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#b0c4de',
    borderColor: "#b0c4de",
    borderWidth: 2,
    borderRadius: 1,
  },
  textInput1: {
    marginTop: 20,
    width: "90%",
    height: 40,
    borderColor: "#f0f8ff",
    backgroundColor: '#f0f8ff',
    borderWidth: 2,
    // borderRadius: 5,
    paddingLeft: 3,
    color: "black",
    fontSize: 16
  },
  closeButtonStyle: {
    width: "60%",
    borderColor: "#b0c4de",
    backgroundColor: "#f0f8ff",
    flexShrink: 1,
    padding: 10,
    height: 40,
    marginBottom: 10,
    marginTop: 10,
    marginLeft: 60,
    borderRadius: 3,
    borderWidth: 0.5,
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center"
  },
  textStyle: {
    fontSize: 18,
    justifyContent: 'center',
    // marginLeft: 50,
    padding: 10,
    paddingBottom: 10,
    // alignItems: 'flex-end',
    textAlign: 'center',
  },
  buttontext: {
    color: '#fffafa',
    fontSize: 15
  },
  flatlistView: {
    flex: 1,
    borderRadius: 30,
    backgroundColor: 'transparent',
    width: "100%",
    padding: 20,
  },
  flatlistStyle: {
    flex: 1,
    paddingLeft: 50,
    marginTop: 0,
    backgroundColor: "#f0f8ff",
  },
  countryList: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  countryStyle: {
    fontSize: 15,
    color: 'black',
    justifyContent: 'center',
  },
  flag: {
    fontSize: 30,
    justifyContent: "center"
  },
  spinnerStyle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  loadingText: {
    fontSize: 18,
    color: '#b0c4de',
  }
  // button: {
  //   marginTop: 20,
  //   padding: 10,
  // },
});
