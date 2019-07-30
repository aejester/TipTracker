import {
  createBottomTabNavigator,
  createStackNavigator,
  createAppContainer
} from 'react-navigation';

import {
  View,
  Text,
  TouchableOpacity,
  AsyncStorage,
  StyleSheet,
  StatusBar,
  SegmentedControlIOS,
  TextInput,
  Keyboard,
  Alert,
  FlatList,
  ScrollView,
  Button,
  Switch
} from 'react-native';

import React from 'react';
import {Ionicons} from "@expo/vector-icons";
import {
  SearchBar,
  Divider
} from 'react-native-elements';

class DetailsScreen extends React.Component {
  static navigationOptions = {
    title: "Edit Total",
    headerStyle: {
      backgroundColor: "#03C04A"
    },
    headerTitleStyle: {
      color: "white"
    },
    headerTintColor: "#fff"
  }
  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: 0,
      text: ""
    }
  }
  handlePress = async () => {
    if (this.state.text == "") {
      return;
    }
    Keyboard.dismiss();
    
    console.log("lmao")
    let total;
    try {
      total = await AsyncStorage.getItem("@tiptracker_total");
      if (total == null) {
        total = "$"+0
      }
    } catch(e) {
      console.log(e);
    }
    total = parseFloat(total.toString().replace("$", ""));
    if (total == "NaN") {
      total = 0
    }
    if (this.state.selectedIndex == 0) {
      total += parseFloat(this.state.text);
    } else {
      total -= parseFloat(this.state.text);
    }
    try {
      await AsyncStorage.setItem("@tiptracker_total", "$"+total.toString());
    } catch(e) {
      console.log(e)
    }
    console.log("pressed");
    Alert.alert("Success!", "You have updated your total!");
    this.setState({text: ""})
  }
  render() {
    return (
      <View style={{
        marginTop: 20,
        marginLeft: 20,
        marginRight: 20
      }}>
        
        <StatusBar barStyle="light-content" />
        <Text style={{
            fontSize: 42,
            fontWeight: "300"
          }}>Edit Total</Text>
          <Text style={{
            fontSize: 18,
            fontWeight: "300"
          }}>Fix the total amount if you made a mistake without having it effect the latest transaction, and spent or gained money.{"\n"}{"\n"}</Text>
        <SegmentedControlIOS
          values={['+', '-']}
          selectedIndex={this.state.selectedIndex}
          onChange={(event) => {
            this.setState({selectedIndex: event.nativeEvent.selectedSegmentIndex});
          }}
          tintColor={"#03C04A"}
        />
        <Text>{"\n"}{"\n"}{"\n"}</Text>
        <View style={{
          flex: 1,
          justifyContent: "center",
          alignContent: "center"
        }}>
          <TextInput keyboardType={"decimal-pad"} style={{
            borderColor: "gray",
            borderRadius: 10,
            fontSize: 48,
            textAlign: "center",
            borderWidth: 1,
            height: 50
          }} onChangeText={(text) => {
            this.setState({text: text});

          }}
          value={this.state.text}/>
          <TouchableOpacity onPress={async () => {
            await this.handlePress();
          }} style={{
            marginTop: 30
          }}>
            <Text style={styles.button}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      total: "$0.00",
      latest: "+$0.00 on --/--/----",
      spent: "$0.00",
      gained: "$0.00"
    }
  }
  static navigationOptions = {
    title: "Home",
    headerStyle: {
      backgroundColor: "#03C04A"
    },
    headerTitleStyle: {
      color: "white"
    }
  }
  load = async () => {
    let total;
    try {
      total = await AsyncStorage.getItem("@tiptracker_total");
      if (total == null) {
        total = "$"+0
      }
      this.setState({total: total});
    } catch(e) {
      console.log(e)
    }
    let latest;
    try {
      latest = await AsyncStorage.getItem("@tiptracker_latest");
      if (latest !== null) {
        this.setState({latest: latest})
      }
    } catch(e) {
      console.log(e)
    }
    let list;
    try {
      list = await AsyncStorage.getItem("@tiptracker_list")
      if (list == null) {
        list = new Array();
      }
      let spent = 0;
      let gained = 0;
      list = list.split(";")
      for (let i = 0; i < list.length; i++) {
        console.log(list[i].split(" on ")[0][0])
        if (list[i].split(" on ")[0][0] == "-") {
          let s = list[i].split(" on ")[0];
          s = s.replace("-$", "")
          s = parseFloat(s)
          spent += s;
        } else if (list[i].split(" on ")[0][0] == "+") {
          let s = list[i].split(" on ")[0];
          s = s.replace("+$", "")
          s = parseFloat(s)
          gained += s;
        }
      }
      this.setState({
        spent: "$"+spent,
        gained: "$"+gained
      })
    } catch(e) {
      console.log(e)
    }
  }
  componentDidMount() {
    this.didFocusSubscription = this.props.navigation.addListener(
      'didFocus',
      payload => {
        this.load()
      }
    )
  }
  render() {
    return (
      <ScrollView style={{
        marginTop: 20,
        marginLeft: 20
      }}>
        <View styles={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center"
        }}>
          <Text style={{
            fontSize: 42,
            fontWeight: "300"
          }}>Account Summary{"\n"}</Text>
        </View>
        <StatusBar barStyle="light-content"></StatusBar>
        <Text style={styles.title}>${parseFloat(this.state.total.replace("$", "")).toFixed(2)}</Text>
        <Text style={styles.subtitle}>Total Amount{"\n"}{"\n"}</Text>
        <Text style={styles.latest}>{this.state.latest}</Text>
        <Text style={styles.subtitle}>Latest Transactions{"\n"}{"\n"}</Text>
        <View style={{flexDirection:"row"}}>
          <View style={{flex:1}}>
              <Text style={styles.latest}>${parseFloat(this.state.spent.replace("$", "")).toFixed(2)}</Text>
              <Text style={styles.subtitle}>Total Spent $$</Text>
          </View>
          <View style={{flex:1}}>
              <Text style={styles.latest}>${parseFloat(this.state.gained.replace("$", "")).toFixed(2)}</Text>
              <Text style={styles.subtitle}>Total Gained $$</Text>
          </View>
        </View>
        <View styles={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center"
        }}>
          <Text style={{
            fontSize: 70,
            textAlign: "center"
          }}>{"\n"}🤑</Text>
        </View>
      </ScrollView>
    );
  }
}

class SettingsScreen extends React.Component {
  static navigationOptions = {
    title: "Money Management",
    headerStyle: {
      backgroundColor: "#03C04A"
    },
    headerTitleStyle: {
      color: "white"
    }
  }
  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: 0,
      text: '',
      type: ''
    }
  }

  handlePress = async () => {
    if (this.state.text == "") {
      return;
    }
    Keyboard.dismiss();
    
    console.log("lmao")
    let total;
    try {
      total = await AsyncStorage.getItem("@tiptracker_total");
      if (total == null) {
        total = "$"+0
      }
    } catch(e) {
      console.log(e);
    }
    total = parseFloat(total.toString().replace("$", ""));
    if (total == "NaN") {
      total = 0
    }
    if (this.state.selectedIndex == 0) {
      total += parseFloat(this.state.text);
    } else {
      total -= parseFloat(this.state.text);
    }
    try {
      await AsyncStorage.setItem("@tiptracker_total", "$"+total.toString());
    } catch(e) {
      console.log(e)
    }
    console.log("pressed");
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!

    var yyyy = today.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    } 
    if (mm < 10) {
      mm = '0' + mm;
    } 
    var today = mm + '/' + dd + '/' + yyyy;

    try {
      let y = ""
      if (this.state.type != "") {
        y = " ("+this.state.type+")";
      }
      await AsyncStorage.setItem("@tiptracker_latest", ["+", "-"][this.state.selectedIndex]+"$"+this.state.text+" on "+today+""+y);
    } catch(e) {
      console.log(e)
    }

    try {
      let x = await AsyncStorage.getItem("@tiptracker_list");
      if (x == null) {
        x = new Array
      } else {
        x = x.split(";")
      }
      let y = ""
      if (this.state.type != "") {
        y = " ("+this.state.type+")";
      }
      x.push(["+", "-"][this.state.selectedIndex]+"$"+this.state.text+" on "+today+""+y);
      try {
        await AsyncStorage.setItem("@tiptracker_list", x.join(";"));
      } catch(e) {
        console.log(e)
      }
    } catch(e) {
      console.log(e)
    }
    Alert.alert("Success!", "You have updated your total!");
    this.setState({text: "", type: ''})
  }
  render() {
    return (
      <View style={{
        marginTop: 20,
        marginLeft: 20,
        marginRight: 20
      }}>
        
        <StatusBar barStyle="light-content" />
        <Text style={{
            fontSize: 42,
            fontWeight: "300"
          }}>Money Managment{"\n"}</Text>
          <Button title="Make a mistake?" color={"#03C04A"} onPress={() => {
          this.props.navigation.navigate("Details")
        }}></Button>
        <Text>{"\n"}{"\n"}</Text>
        <SegmentedControlIOS
          values={['+', '-']}
          selectedIndex={this.state.selectedIndex}
          onChange={(event) => {
            this.setState({selectedIndex: event.nativeEvent.selectedSegmentIndex});
          }}
          tintColor={"#03C04A"}
        />
        <View style={{
          flex: 1,
          justifyContent: "center",
          alignContent: "center",
          marginTop: 100
        }}>
          <TextInput placeholder="0.00" keyboardType={"decimal-pad"} style={{
            borderColor: "gray",
            borderRadius: 10,
            fontSize: 48,
            textAlign: "center",
            borderWidth: 1,
            height: 50,
            marginTop: 40
          }} onChangeText={(text) => {
            this.setState({text: text});

          }}
          value={this.state.text}/>
          <TextInput placeholder="Groceries, etc." style={{
            borderColor: "gray",
            borderRadius: 10,
            fontSize: 48,
            textAlign: "center",
            borderWidth: 1,
            height: 50,
            marginTop: 40
          }} onChangeText={(text) => {
            this.setState({type: text});

          }}
          value={this.state.type}/>
          <TouchableOpacity onPress={async () => {
            await this.handlePress();
          }} style={{
            marginTop: 30
          }}>
            <Text style={styles.button}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

class HistoryScreen extends React.Component {
  static navigationOptions = {
    title: "History",
    headerStyle: {
      backgroundColor: "#03C04A"
    },
    headerTitleStyle: {
      color: "white"
    }
  }
  constructor(props) {
    super(props);
    this.state = {
      dataSource: ["No Past Transactions"],
      text: ""
    }
    this.arrayHolder = []
  }
  load = async () => {
    try {
      let y = await AsyncStorage.getItem("@tiptracker_list");
      if (y == null) {
        y = "No Past Transactions"
      }
      this.setState({dataSource: y.split(";")})
      this.arrayHolder = y.split(";");
    } catch(e) {
      console.log(e)
    }
  }
  componentDidMount() {
    this.didFocusSubscription = this.props.navigation.addListener(
      'didFocus',
      payload => {
        this.load()
      }
    )
  }
  searchFilterFunction = text => {    
    const newData = this.arrayHolder.filter(item => {      
      const itemData = item.toUpperCase()
      
       const textData = text.toUpperCase();
        
       return itemData.indexOf(textData) > -1;    
    });
    
    this.setState({ dataSource: newData });  
  };
  render() {
    return (
      <View>
        <SearchBar placeholder="Search Past Transactions"  
          platform="ios"      
        lightTheme           
        onChangeText={text => {this.setState({text: text});
        this.searchFilterFunction(text)}}
        autoCorrect={false} 
        onCancel={() => {
          this.setState({dataSource: this.arrayHolder});
        }}
        onClear={() => {
          this.setState({dataSource: this.arrayHolder});
        }}
        value={this.state.text}
        cancelButtonTitle={"Cancel"}
        cancelButtonProps={{
          color: "#03C04A"
        }}/>
        <ScrollView style={{height:"90%"}}>
      <FlatList
        data={this.state.dataSource.reverse()}
        renderItem={({item}) => ( <View>
          <Text style={{fontSize:24, fontWeight:"bold"}}>{item.split(" on ")[0]}</Text>
          <Text style={{fontSize:18}}> on {item.split(" on ")[1]}{"\n"}</Text>
          <Divider />
        </View> )
      }
        style={{
          marginLeft: 20,
          marginTop: 20,
          marginRight: 20,
          height: "100%"
        }}
      />
      
      </ScrollView>
      </View>
    );
  }
}

class OptionsScreen extends React.Component {
  static navigationOptions = {
    title: "Options",
    headerStyle: {
      backgroundColor: "#03C04A"
    },
    headerTitleStyle: {
      color: "white"
    }
  }
  constructor(props) {
    super(props);
    this.state = {
      notifications: false
    }
  }
  destroy = async () => {
    Alert.alert(
      'Are you sure?',
      'This action cannot be undone if you proceed.',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {text: 'OK', onPress: async () => {
          try {
            await AsyncStorage.removeItem("@tiptracker_total")
            await AsyncStorage.removeItem("@tiptracker_latest")
            await AsyncStorage.removeItem("@tiptracker_list")
            await AsyncStorage.removeItem("@tiptracker_spent")
            await AsyncStorage.removeItem("@tiptracker_gained")
            Alert.alert("Success!", "Your data was reset.")
          } catch(e) {
            Alert.alert("Error.", "There was an error in the process: "+e);
            console.log(e)
          }
        }},
      ],
      {cancelable: false},
    );
  }
  render() {
    return (
      <ScrollView style={{
        marginLeft: 20,
        marginRight: 20,
        marginTop: 20
      }}>
        <Text style={{
        fontSize: 42,
        fontWeight: "300"
      }}>Options{"\n"}</Text>
        <Text style={{
          color: "gray",
          fontSize: 10
        }}>NOTIFICATIONS</Text>
        <View style={{
           flex: 1,
           flexDirection: 'row',
           alignItems: 'center',
           justifyContent: 'center',
        }}>
          <Text style={{
            fontSize: 18,
            width: "85%"
          }}>Allow Push Notifications</Text>
          <Switch value={this.state.notifications} />
        </View>
        <Text style={{
          color: "gray",
          fontSize: 10
        }}>DATA</Text>
        <View style={{
           flex: 1,
           flexDirection: 'row',
           alignItems: 'center',
           justifyContent: 'center',
        }}>
          <Text style={{
            fontSize: 18,
            width: "70%"
          }}>Reset All Data</Text>
          <Button title="Reset Data" color="red" onPress={this.destroy}></Button>
        </View>
      </ScrollView>
    );
  }
}


const HomeStack = createStackNavigator({
  Home: HomeScreen,
  Details: DetailsScreen,
});

const SettingsStack = createStackNavigator({
  Settings: SettingsScreen,
  Details: DetailsScreen,
});

const HistoryStack = createStackNavigator({
  History: HistoryScreen,
  Details: DetailsScreen
})

const OptionsStack = createStackNavigator({
  Options: OptionsScreen,
  Details: DetailsScreen
})

export default createAppContainer(createBottomTabNavigator(
  {
    Home: HomeStack,
    Money: SettingsStack,
    History: HistoryStack,
    Options: OptionsStack
  },
  {
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, horizontal, tintColor }) => {
        const { routeName } = navigation.state;
        let IconComponent = Ionicons;
        let iconName;
        if (routeName === 'Home') {
          iconName = `ios-today`;
        } else if (routeName === 'Money') {
          iconName = `ios-card`;
        } else if (routeName === 'History') {
          iconName = "ios-time"
        } else if (routeName === 'Options') {
          iconName = "ios-settings"
        }
        // You can return any component that you like here!
        return <IconComponent name={iconName} size={25} color={tintColor} />;
      }
    }),
    tabBarOptions: {
      activeTintColor: "#03C04A",
      inactiveTintColor: "lightgray"
    }
  }
));

const styles = StyleSheet.create({
  title: {
    fontSize: 52,
    fontWeight: "400"
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "300"
  },
  latest: {
    fontSize: 38,
    fontWeight: "400"
  },
  button: {
    backgroundColor: '#03C04A',
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 12,
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    overflow: 'hidden',
    padding: 12,
    textAlign:'center',
    height: 55
  },
  separator: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#8E8E8E',
  },
  container: {
    flex: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    marginLeft: 12,
    fontSize: 16,
  }
})