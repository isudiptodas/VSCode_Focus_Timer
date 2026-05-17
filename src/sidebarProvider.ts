import * as vscode from 'vscode';

export class SidebarProvider
    implements vscode.WebviewViewProvider {

    private _view?: vscode.WebviewView;

    constructor(
        private startTimerCallback:
            (hours: number, minutes: number) => void,

        private restartTimerCallback:
            () => void
    ) { }

    resolveWebviewView(
        webviewView: vscode.WebviewView
    ) {

        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true
        };

        this.showInputView();

        webviewView.webview.onDidReceiveMessage(
            (message) => {
                if (message.type === "start") {
                    this.startTimerCallback(
                        Number(message.hours),
                        Number(message.minutes)
                    );
                }
                if (message.type === "restart") {
                    this.restartTimerCallback();
                }
            }
        );
    }

    showInputView() {

        if (!this._view) return;

        this._view.webview.html = `
        <!DOCTYPE html>
        <html>

        <body style="
            padding:20px;
            background:#0d1117;
            color:white;
            display: flex;
            flex-direction: column;
            justify-items: start;
            align-items: center;
            font-family:sans-serif;
        ">

            <h1>Focus Timer</h1>

            <label>Hours (Max 2)</label>

            <input
                id="hours"
                type="number"
                min="0"
                max="2"
                value="0"
                style="
                    width:100%;
                    padding:10px;
                    margin-top:5px;
                    margin-bottom:15px;
                    border-radius:8px;
                    border:none;
                "
            />

            <label>Minutes</label>

            <input
                id="minutes"
                type="number"
                min="0"
                max="59"
                value="25"
                style="
                    width:100%;
                    padding:10px;
                    margin-top:5px;
                    margin-bottom:20px;
                    border-radius:8px;
                    border:none;
                "
            />

            <button
                id="start"
                style="
                    width:100%;
                    padding:12px;
                    background:#00ff88;
                    border:none;
                    cursor:pointer;
                    font-weight:bold;
                    border-radius:10px;
                "
            >
                Start Timer
            </button>

            <script>

                const vscode = acquireVsCodeApi();

                document
                    .getElementById('start')
                    .addEventListener('click', () => {

                        const hours =
                            document.getElementById('hours').value;

                        const minutes =
                            document.getElementById('minutes').value;

                        const parsedHours = Number(hours);
                        const parsedMinutes = Number(minutes);

                        if (
                            parsedHours > 2 ||
                            (parsedHours === 2 && parsedMinutes > 0)
                        ) {

                            alert(
                                "Maximum timer limit is 2 hours only."
                            );

                            return;
                        }

                        vscode.postMessage({
                            type:'start',
                            hours,
                            minutes
                        });

                    });

            </script>

        </body>

        </html>
        `;
    }

    updateSidebarTimer(
        remainingSeconds: number,
        totalSeconds: number
    ) {

        if (!this._view) return;

        const percentage = Math.floor(
            (remainingSeconds / totalSeconds) * 100
        );

        let color = "#00ff88";

        if (percentage <= 70) color = "#ffee00";
        if (percentage <= 40) color = "#ff9900";
        if (percentage <= 15) color = "#ff0000";

        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;

        const radius = 60;
        const circumference = 2 * Math.PI * radius;

        const offset =
            circumference -
            (percentage / 100) * circumference;

        this._view.webview.html = `
        <!DOCTYPE html>
        <html>

        <body style="
            background:#0d1117;
            color:white;
            font-family:sans-serif;
            display:flex;
            justify-content:center;
            align-items:center;
            flex-direction:column;
            height:100vh;
            overflow:hidden;
        ">

            <svg width="180" height="180">

                <circle
                    cx="90"
                    cy="90"
                    r="${radius}"
                    stroke="#222"
                    stroke-width="10"
                    fill="none"
                />

                <circle
                    cx="90"
                    cy="90"
                    r="${radius}"
                    stroke="${color}"
                    stroke-width="10"
                    fill="none"
                    stroke-linecap="round"
                    stroke-dasharray="${circumference}"
                    stroke-dashoffset="${offset}"
                    transform="rotate(-90 90 90)"
                    style="
                        transition:0.5s;
                        filter:drop-shadow(0 0 10px ${color});
                    "
                />

            </svg>

            <div style="
                position:absolute;
                top:46%;
                left:50%;
                transform:translate(-50%, -50%);
                display:flex;
                flex-direction:column;
                justify-content:center;
                align-items:center;
            ">

                <div style="
                    font-size:24px;
                    font-weight:bold;
                    line-height:1;
                ">
                    ${minutes}:${seconds
                            .toString()
                            .padStart(2, '0')}
                </div>

                <div style="
                    margin-top:8px;
                    color:${color};
                    font-size:18px;
                    font-weight:bold;
                    text-shadow:0 0 10px ${color};
                    line-height:1;
                ">
                    ${percentage}%
                </div>

            </div>

            <button
                id="restart"
                style="
                    margin-top:35px;
                    padding:12px 20px;
                    border:none;
                    border-radius:10px;
                    background:#ff4444;
                    color:white;
                    cursor:pointer;
                    font-weight:bold;
                "
            >
                Restart
            </button>

            <script>

                const vscode = acquireVsCodeApi();

                document
                    .getElementById('restart')
                    .onclick = () => {

                        vscode.postMessage({
                            type:'restart'
                        });

                    };

            </script>

        </body>

        </html>
        `;
    }

    showTimerView() {
        // kept for compatibility
    }
}