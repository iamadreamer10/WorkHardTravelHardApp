import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Button,
} from 'react-native';
import { theme } from './color';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'
import Fontisto from '@expo/vector-icons/Fontisto';
import Checkbox from 'expo-checkbox';
import AntDesign from '@expo/vector-icons/AntDesign';

const STORAGE_KEY = "@toDos"
const STORAGE_PAGE = "@working"

// 1. 완료 상태 구분 (completed)

// 2. 수정이 가능하게 해줘 (modify)
// 3. 나갔다 들어왔을 떄, Work 화면 or Travel 화면 중 최근에 들어왔던 화면으로 가게 해줘줘


export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState();
  const [editText, setEditText] = useState();
  const [toDos, setToDos] = useState({});
  const [editing, setEditing] = useState("");
  useEffect(() => {
    loadToDos();
  }, [])

  const travel = async () => {
    setWorking(false);
    await AsyncStorage.setItem(STORAGE_PAGE, JSON.stringify(false))
  }

  const work = async () => {
    setWorking(true);
    await AsyncStorage.setItem(STORAGE_PAGE, JSON.stringify(true))
  }

  const onChangeText = (payload) => setText(payload);
  const onChangeEditText = (payload) => {
    console.log(payload)
    setEditText(payload);
  }
  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  }

  const loadToDos = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      const p = await AsyncStorage.getItem(STORAGE_PAGE)
      setToDos(JSON.parse(s))
      setWorking(JSON.parse(p))
    } catch (error) {
      console.error("There's an error!")
    }
  };

  const addToDo = async () => {
    if (text == "") {
      return
    }
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, completed: false }
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  }

  const toggleToDo = async (key) => {
    const newToDos = { ...toDos };
    newToDos[key].completed = !newToDos[key].completed; 
    setToDos(newToDos); 
    await saveToDos(newToDos);
  };

  const setEditToDo = (key) => {
    setEditing(key);
    setEditText(toDos[key].text)
  }

  const completeEditToDo = async (key) => {
    const newToDos = { ...toDos };
    newToDos[key].text = editText;
    setToDos(newToDos);
    setEditing("");
    await saveToDos(newToDos)
  }

  const deleteToDo = async (key) => {
    Alert.alert(
      "Deleto To Do",
      "Are you sure?", [
      { text: "Cancel" },
      {
        text: "I'm Sure",
        style: "destructive",
        onPress: () => {
          const newToDos = { ...toDos }
          delete newToDos[key]
          setToDos(newToDos);
          saveToDos(newToDos);
        }
      }
    ]);
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={{ ...styles.btnText, color: working ? "white" : theme.grey }}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text style={{ ...styles.btnText, color: !working ? "white" : theme.grey }}>Travel</Text>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput
          returnKeyType='done'
          onSubmitEditing={addToDo}
          onChangeText={onChangeText}
          value={text}
          placeholder={working ? "Add a To Do" : "Where do you want to go?"}
          style={styles.input} />
      </View>
      <ScrollView>
        {Object.keys(toDos).map(key =>
          toDos[key].working == working ? (
            <View style={styles.toDo} key={key}>{
              editing == key ? (
                <TextInput flex={10}
                  returnKeyType='done'
                  value={editText}
                  onSubmitEditing={() => completeEditToDo(key)}
                  onChangeText={onChangeEditText}
                  style={styles.editInput}
                />
              ) : (
                <Text flex={10} style={[styles.toDoText, toDos[key].completed && { textDecorationLine: 'line-through' }]} >{toDos[key].text}</Text>
              )
            }
              <TouchableOpacity onPress={() => { setEditToDo(key) }}>
                <AntDesign name="edit" size={24} color="white" />
              </TouchableOpacity>
              <View flex={1} style={styles.checkbox}>
                <Checkbox
                  onValueChange={() => toggleToDo(key)}
                  value={toDos[key].completed}
                />
              </View>
              <View flex={1}>
                <TouchableOpacity onPress={() => deleteToDo(key)}>
                  <Fontisto name="trash" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  editInput: {
    backgroundColor: "white",
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 5,
    fontSize: 16,
  },
  toDo: {
    flexDirection: "row",
    backgroundColor: theme.grey,
    marginBottom: 10,
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  checkbox: {
    marginHorizontal: 20,
    marginVertical: 6,
  }
});
