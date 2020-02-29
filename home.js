import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import apps from "./App";
import verify from "./verify";
import Newcode from "./newCode";

const MainNavigator = createStackNavigator({
  app: { screen: apps },
  verification: { screen: verify },
  newcode: {
    screen: Newcode,
    navigationOptions: {
      headerBackTitle: 'some label'
    },
  },
});
export default createAppContainer(MainNavigator);
