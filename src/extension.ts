import * as vscode from 'vscode';
import { SidebarProvider } from './sidebarProvider';

let timerInterval: NodeJS.Timeout | undefined;

let totalSeconds = 0;
let remainingSeconds = 0;

let sidebarProviderInstance: SidebarProvider;

export function activate(context: vscode.ExtensionContext) {

	sidebarProviderInstance = new SidebarProvider(
		startTimer,
		restartTimer
	);

	context.subscriptions.push(

		vscode.window.registerWebviewViewProvider(
			"focusTimerView",
			sidebarProviderInstance
		)

	);
}

function startTimer(hours: number, minutes: number) {

	totalSeconds = (hours * 3600) + (minutes * 60);
	remainingSeconds = totalSeconds;
	sidebarProviderInstance.showTimerView();

	if (timerInterval) {
		clearInterval(timerInterval);
	}

	timerInterval = setInterval(() => {

		remainingSeconds--;

		sidebarProviderInstance.updateSidebarTimer(
			remainingSeconds,
			totalSeconds
		);

		if (remainingSeconds <= 0) {

			clearInterval(timerInterval);

			vscode.window.showWarningMessage(
				"Time is over! Take a break, hydrate yourself and relax.",
				"Got It",
				"Cancel"
			).then((selection) => {
				if (selection === "Got It") {
					restartTimer();
				}
			});
		}

	}, 1000);
}

function restartTimer() {

	if (timerInterval) {
		clearInterval(timerInterval);
	}

	remainingSeconds = 0;
	totalSeconds = 0;

	sidebarProviderInstance.showInputView();

}

function showCompletionPopup() {

	vscode.window.showWarningMessage(
		"Time is over! Take a break, hydrate yourself, relax a little.",
		"Got It",
		"Cancel"
	).then((selection) => {
		if (selection === "Got It") {
			restartTimer();
		}
	});
}

export function deactivate() { }