import React, { useEffect, useState, useRef } from "react";
import { View, Text, FlatList, TouchableOpacity, Modal, ScrollView, Alert } from "react-native";
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from "react-native-maps";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Button, ScreenWrapper, TextField } from "@/components";
import { ms } from "@/utils";
import { fonts } from "@/theme";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/redux/actions/authAction";
import { db } from "@/services/firebase"; // Ensure this matches your export
import { ref, push, set, onValue, update } from "firebase/database";
import socket from "@/services/socket";
import { showErrorToast, showSuccessToast, showInfoToast } from "@/components/ToastAlert";

const Home = () => {
  const { theme } = useUnistyles();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  // console.log('usersssssss', user)

  const [tasks, setTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", latitude: 31.3260, longitude: 75.5762 });
  const [loading, setLoading] = useState(false);

  // Default region for map
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useEffect(() => {
    if (!user?.uid) return;

    // 1. Listen to Realtime Database updates for the specific user
    const tasksRef = ref(db, `tasks/${user.uid}`);
    const unsubscribe = onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const fetchedTasks = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => b.createdAt - a.createdAt); // Sort by createdAt desc
        setTasks(fetchedTasks);
        console.log("Fetched Tasks:", fetchedTasks);
      } else {
        setTasks([]);
      }
    }, (error) => {
      console.log("Database Error:", error);
      showErrorToast({ title: "Error fetching tasks" });
    });

    // 2. Listen to Socket updates
    socket.on("taskUpdated", (data) => {
      console.log("Socket Update:", data);
      showInfoToast({
        title: "Task Update",
        message: `Task "${data.title}" status changed to ${data.status} `,
      });
    });

    return () => {
      unsubscribe();
      socket.off("taskUpdated");
    };
  }, [user?.uid]);

  const handleAddTask = async (taskData) => {
    // Use taskData if provided, otherwise fallback to state (safety)
    const data = taskData || newTask;

    if (!data.title || !data.description) {
      Alert.alert("Validation", "Please enter title and description");
      return;
    }

    setLoading(true);
    try {
      if (!user?.uid) {
        Alert.alert("Error", "User not logged in");
        return;
      }
      const tasksRef = ref(db, `tasks/${user.uid}`);
      const newTaskRef = push(tasksRef); // Create new Ref with ID
      await set(newTaskRef, {
        ...data,
        status: "pending",
        createdAt: Date.now(), // Use timestamp
        userId: user.uid,
      });

      console.log('add task success');
      setModalVisible(false);
      setNewTask({ title: "", description: "", latitude: region.latitude, longitude: region.longitude });
      showSuccessToast({ title: "Task added successfully" });
    } catch (error) {
      console.error("Add Task Error:", error);
      showErrorToast({ title: "Failed to add task" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (task, newStatus) => {
    try {
      if (!user?.uid) return;
      const taskRef = ref(db, `tasks/${user.uid}/${task.id}`);
      await update(taskRef, { status: newStatus });

      // Emit socket event
      socket.emit("taskStatusChanged", {
        taskId: task.id,
        title: task.title,
        status: newStatus,
      });

    } catch (error) {
      console.error("Update Status Error:", error);
      showErrorToast({ title: "Failed to update status" });
    }
  };

  const onPressLogout = () => {
    dispatch(logout());
  };

  const onMapPress = (e) => {
    setNewTask({ ...newTask, latitude: e.nativeEvent.coordinate.latitude, longitude: e.nativeEvent.coordinate.longitude });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'in-progress': return '#2196F3';
      default: return '#FFC107'; // pending
    }
  };

  return (
    <ScreenWrapper style={styles.container}>

      <View style={{ flex: 1 }}>


        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {user?.email}</Text>
          <TouchableOpacity onPress={onPressLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Map Section */}
        <View style={styles.mapContainer}>


          <MapView
            style={StyleSheet.absoluteFill}
            region={region}
            initialRegion={region}
            onRegionChangeComplete={setRegion}
            onPress={modalVisible ? onMapPress : undefined} // Allow selecting location only when modal is technically "active" logic or just let them pick anytime? Let's just let them view map primarily.
          // Actually, let's let them pick a location via a specialized UI or just assume current region center for simplicity if we don't have drag-drop.
          // Better: Click map to set 'newTask' location if we were in a 'pick mode'.
          // For this demo: Just show markers.
          >
            {tasks.map((task) => (
              <Marker
                key={task.id}
                coordinate={{ latitude: task.latitude, longitude: task.longitude }}
                pinColor={getStatusColor(task.status)}
              >
                <Callout>
                  <View style={styles.callout}>
                    <Text style={styles.calloutTitle}>{task.title}</Text>
                    <Text style={styles.calloutStatus}>Status: {task.status}</Text>
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>
        </View>

        {/* Task List Section */}
        <View style={styles.listContainer}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Tasks</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Text style={styles.addButton}>+ Add Task</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.taskItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.taskTitle}>{item.title}</Text>
                  <Text style={styles.taskDesc}>{item.description}</Text>
                  <Text style={[styles.taskStatus, { color: getStatusColor(item.status) }]}>{item.status.toUpperCase()}</Text>
                </View>
                <View style={styles.statusActions}>
                  {item.status !== 'pending' && <TouchableOpacity onPress={() => handleUpdateStatus(item, 'pending')}><Text style={styles.actionText}>Pending</Text></TouchableOpacity>}
                  {item.status !== 'in-progress' && <TouchableOpacity onPress={() => handleUpdateStatus(item, 'in-progress')}><Text style={styles.actionText}>In-Prog</Text></TouchableOpacity>}
                  {item.status !== 'completed' && <TouchableOpacity onPress={() => handleUpdateStatus(item, 'completed')}><Text style={styles.actionText}>Done</Text></TouchableOpacity>}
                </View>
              </View>
            )}
          />
        </View>

        {/* Add Task Modal */}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>New Task</Text>
              <TextField
                placeholder="Title"
                value={newTask.title}
                onChangeText={(t) => setNewTask({ ...newTask, title: t })}
                containerStyle={styles.input}
              />
              <TextField
                placeholder="Description"
                value={newTask.description}
                onChangeText={(t) => setNewTask({ ...newTask, description: t })}
                containerStyle={styles.input}
              />
              <Text style={styles.hintText}>Location will be map center: {region.latitude.toFixed(4)}, {region.longitude.toFixed(4)}</Text>

              <Button
                title={loading ? "Saving..." : "Save Task"}
                onPress={() => {
                  const taskToAdd = { ...newTask, latitude: region.latitude, longitude: region.longitude };
                  handleAddTask(taskToAdd);
                }}
              />
              <Button title="Cancel" style={{ marginTop: 10, backgroundColor: 'red' }} onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </Modal>

      </View>

    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create((theme) => ({
  container: {
    padding: 0, // Fill screen
    // flex: 1,
  },
  header: {
    padding: ms(15),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 2,
  },
  greeting: {
    fontFamily: fonts.openSan.bold,
    fontSize: ms(16),
  },
  logoutText: {
    color: 'red',
    fontFamily: fonts.openSan.semiBold,
  },
  mapContainer: {
    // height: '40%',
    // width: '100%',
    flex: 0.6,
    // width: '100%',
    // backgroundColor: 'red',

  },
  listContainer: {
    flex: 1,
    padding: ms(15),
    backgroundColor: '#f5f5f5',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ms(10),
  },
  listTitle: {
    fontFamily: fonts.openSan.bold,
    fontSize: ms(20),
  },
  addButton: {
    // width: ms(100),
    // height: ms(35),
  },
  taskItem: {
    backgroundColor: 'white',
    padding: ms(15),
    borderRadius: ms(10),
    marginBottom: ms(10),
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskTitle: {
    fontFamily: fonts.openSan.bold,
    fontSize: ms(16),
  },
  taskDesc: {
    fontFamily: fonts.openSan.regular,
    fontSize: ms(14),
    color: '#666',
  },
  taskStatus: {
    fontFamily: fonts.openSan.semiBold,
    fontSize: ms(12),
    marginTop: ms(5),
  },
  statusActions: {
    justifyContent: 'space-around',
    marginLeft: ms(10),
  },
  actionText: {
    fontSize: ms(12),
    color: '#007AFF',
    paddingVertical: ms(2),
  },
  callout: {
    width: ms(150),
    padding: ms(5),
  },
  calloutTitle: {
    fontWeight: 'bold',
  },
  calloutStatus: {
    fontSize: ms(12),
    color: 'gray',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    padding: ms(20),
    borderRadius: ms(15),
  },
  modalTitle: {
    fontSize: ms(20),
    fontFamily: fonts.openSan.bold,
    marginBottom: ms(15),
    textAlign: 'center',
  },
  input: {
    marginBottom: ms(15),
  },
  hintText: {
    fontSize: ms(12),
    color: 'gray',
    marginBottom: ms(15),
    textAlign: 'center',
  },
}));
