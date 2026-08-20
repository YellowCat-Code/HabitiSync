import * as hmUI from "@zos/ui";
import { BasePage } from "@zeppos/zml/base-page";
import { FETCH_RESULT_TEXT, TASK_BUTTON, VALUES, DARK_VALUES, centered_x, centered_y, BANNER } from "zosLoader:./index.[pf].layout.js";
import { px } from "@zos/utils";

let textWidget = null;

Page(
  BasePage({
    state: {
      buttons: [],
      banner: null
    },
    build() {
      textWidget = hmUI.createWidget(hmUI.widget.TEXT, {
        ...FETCH_RESULT_TEXT,
        text: "Loading...",
      });
      this.requestCredentials()
        .then(() => this.getTokens())
        .then((tokens) => this.getData(tokens))
        .catch(err => console.log('Init error:', err));

      this.state.banner = hmUI.createWidget(hmUI.widget.BUTTON, {
        ...BANNER,
        longpress_func: () => this.refresh()
      });

      hmUI.redraw()
    },

    requestCredentials() {
      return this.request({
        method: 'GET_CREDENTIALS',
      })
        .then((data) => {
          const { UserName, Password } = data;
          
          if (!UserName || !Password) {
            textWidget.setProperty(hmUI.prop.TEXT, {
              text: "Please enter your Habitica credentials in Settings first"
            });
            throw new Error('Credentials not configured');
          }
          
          this.state.UserName = UserName;
          this.state.Password = Password;
          console.log('Page loaded credentials:', UserName);
        })
        .catch((err) => {
          console.log('Failed to fetch credentials:', err);
          textWidget.setProperty(hmUI.prop.TEXT, {
            text: `Error: ${err.message || err}. Make sure you're logged in from the settings in the store.`
          });
          throw err;
        });
    },

    getTokens() {
      console.log("Getting UUID, API")

      return this.httpRequest({
        method: "POST",
        url: "https://habitica.com/api/v3/user/auth/local/login",
        headers: {
          "Content-Type": "application/json",
          "x-client": "9bb9057b-48ef-4769-85db-c12b8e9b6173-Habitizepp",
          "User-Agent": "Habitizepp"
        },
        body: JSON.stringify({
          username: this.state.UserName.trim(),
          password: this.state.Password
        })
      })
      .then((result) => {
        const resData = typeof result.body === "string" ? JSON.parse(result.body) : result.body;

        if (resData.success) {
          const userId = resData.data.id;
          const apiToken = resData.data.apiToken;
          this.state.userId = userId;
          this.state.apiToken = apiToken;
          console.log("Successfully retrieved Habitica credentials");
          return { userId, apiToken };
        } else {
          throw new Error(resData.message || "Login failed");
        }
      })
      .catch((error) => {
        console.error("HTTP Request Error:", error);
        textWidget.setProperty(hmUI.prop.TEXT, {
          text: `Login failed: ${error.message || error}. Make sure you're logged in from the settings in the store.`
        });
        throw error;
      });
    },




    getData(tokens) {
      console.log("Loading Habitica tasks");

      return this.httpRequest({
        method: "get",
        url: "https://habitica.com/api/v3/tasks/user",
        headers: {
          "User-Agent": "Habitizepp",
          "x-api-user": tokens.userId,
          "x-api-key": tokens.apiToken,
          "x-client": `9bb9057b-48ef-4769-85db-c12b8e9b6173-Habitizepp`,
          "Content-Type": "application/json"
        }
      })
      .then((result) => {
        const response = typeof result.body === "string" ? JSON.parse(result.body) : result.body;

        if (!response || !response.success || !Array.isArray(response.data)) {
          throw new Error(response && response.message ? response.message : "Invalid tasks response");
        }

        const data = response.data;
        const tasks = data.map(item => item.text); // The text of each task
        const taskId = data.map(item => item._id); // Tracks the id of each task for updating it.
        const taskValues = data.map(item => item.value); // Gets the value of each task (To handle colors. This is decided by habitica itself)
        const taskTypes = data.map(item => item.type); // Gets the type of task (Habit, Daily, To do, Reward)
        const habitUp = data.map(item => item.up); // These get if the habit can go up or down (ONLY for habits, as only these can go both ways or none)
        const habitDown = data.map(item => item.down);
        
        
        const getColor = (value) => { 
        if (value > 10) return VALUES[0];
        if (value >= 5) return VALUES[1];
        if (value >= 1) return VALUES[2];
        if (value >= -1) return VALUES[3];
        if (value >= -10) return VALUES[4];
        if (value >= -20) return VALUES[5];
        if (value < -20) return VALUES[5];
        return TASK_BUTTON.normal_color;
        };

        const getDarkColor = (value) => { 
        if (value > 10) return DARK_VALUES[0];
        if (value >= 5) return DARK_VALUES[1];
        if (value >= 1) return DARK_VALUES[2];
        if (value >= -1) return DARK_VALUES[3];
        if (value >= -10) return DARK_VALUES[4];
        if (value >= -20) return DARK_VALUES[5];
        if (value < -20) return DARK_VALUES[5];
        return TASK_BUTTON.press_color;
        };

        textWidget.setProperty(hmUI.prop.VISIBLE, false);

        this.state.buttons = [];
        let row = 0;

        tasks.forEach((taskText, i) => {
          // Main task button (always created)
          this.state.buttons.push(
            hmUI.createWidget(hmUI.widget.BUTTON, {
              ...TASK_BUTTON,
              text: taskText,
              y: px(150) + row * px(80),
              normal_color: 0x686274,
              press_color: 0x878190
            })
          );
        
        
          // If it's a habit, add a second button next to it
          if (taskTypes[i] === "habit" && habitUp[i] === true) {
            this.state.buttons.push(
              hmUI.createWidget(hmUI.widget.BUTTON, {
                ...TASK_BUTTON,
                text: "+",
                x: TASK_BUTTON.x - px(80),
                y: px(150) + row * px(80),
                w: px(70),
                h: px(70),

                normal_color: getColor(taskValues[i]),
                press_color: getDarkColor(taskValues[i]),

                click_func: () => this.scoreTask(taskId[i], "up")
              })
            );
          } 
          if (taskTypes[i] === "habit" && habitDown[i] === true) {
            this.state.buttons.push(
              hmUI.createWidget(hmUI.widget.BUTTON, {
                ...TASK_BUTTON,
                text: "-",
                x: TASK_BUTTON.x + px(210),
                y: px(150) + row * px(80),
                w: px(70),
                h: px(70),

                normal_color: getColor(taskValues[i]),
                press_color: getDarkColor(taskValues[i]),

                click_func: () => this.scoreTask(taskId[i], "down")
              })
            );
          } 
          if (taskTypes[i] !== "habit") {
            this.state.buttons.push(
              hmUI.createWidget(hmUI.widget.BUTTON, {
                ...TASK_BUTTON,
                text: "+",
                x: TASK_BUTTON.x - px(80),
                y: px(150) + row * px(80),
                w: px(70),
                h: px(70),

                normal_color: getColor(taskValues[i]),
                press_color: getDarkColor(taskValues[i]),

                click_func: () => this.scoreTask(taskId[i], "up")
              })
            );
          } 
        
          row++;
        });

        console.log(tasks)
        console.log("Buttons created successfully:", this.state.buttons.length);
      })
      .catch((error) => {
        console.log(`Error: ${error}`);
        textWidget.setProperty(hmUI.prop.TEXT, {
          text: `Task loading failed: ${error.message || error}. Make sure you're logged in from the settings in the store.`
        });
      });
    },

    scoreTask(id, dir) {
      console.log("Scoring task:", id, dir)

      return this.httpRequest({
        method: "POST",
        url: `https://habitica.com/api/v3/tasks/${id}/score/${dir}`,
        headers: {
          "Content-Type": "application/json",
          "x-api-user": this.state.userId,
          "x-api-key": this.state.apiToken,
          "x-client": "9bb9057b-48ef-4769-85db-c12b8e9b6173-Habitizepp",
          "User-Agent": "Habitizepp"
        },
      })
      .then((result) => {
        const resData = typeof result.body === "string" ? JSON.parse(result.body) : result.body;

        if (resData.success) {
          hmUI.showToast({
            text: "Task scored successfully"
          });
        } else {
          throw new Error(resData.message || "Scoring failed");
        }
      })
      .catch((error) => {
        console.error("HTTP Request Error:", error);
        throw error;
      });
    },

    clearTaskButtons() {
      this.state.buttons.forEach((btn) => {
        if (btn) hmUI.deleteWidget(btn);
      });
      this.state.buttons = [];
    },

    refresh() {
      this.clearTaskButtons();

      if (textWidget) {
      textWidget.setProperty(hmUI.prop.VISIBLE, true);
      textWidget.setProperty(hmUI.prop.TEXT, { text: "Loading..." });
      }

      this.requestCredentials()
        .then(() => this.getTokens())
        .then((tokens) => this.getData(tokens))
        .catch(err => console.log('Refresh error:', err));
    }
  })

);