﻿namespace ContactManagerApp {

    class MainController {

        users: ContactManagerApp.User[] = [];
        selected: ContactManagerApp.User = null;
        searchText: string = "";
        tabIndex: number = 0;
        newNote: Note = new Note('', null);
        formScope: any;


        static $inject = ["userService", "$mdSidenav", "$mdToast", "$mdDialog", "$mdMedia", "$mdBottomSheet"];
        constructor(private userService: ContactManagerApp.IUserService,
            private $mdSidenav: angular.material.ISidenavService,
            private $mdToast: angular.material.IToastService,
            private $mdDialog: angular.material.IDialogService,
            private $mdMedia: angular.material.IMedia,
            private $mdBottomSheet: angular.material.IBottomSheetService) {
            var self = this;

            this.userService.loadAllUsers().then((users: ContactManagerApp.User[]) => {
                self.users = users;
                self.selected = users[0];
                self.userService.selectedUser = self.selected;
                console.log(self.users);
            });
        }

        toggleSideNav(): void {
            this.$mdSidenav("left").toggle();
        }

        selectUser(user: ContactManagerApp.User): void {
            this.selected = user;
            this.tabIndex = 0;
            var sidenav = this.$mdSidenav("left");
            if (sidenav.isOpen()) {
                sidenav.close();
            }
        }

        showContactOptions($event) {
            this.$mdBottomSheet.show({
                parent: angular.element(document.getElementById('wrapper')),
                templateUrl: './dist/view/contactSheet.html',
                controller: ContactPanelController,
                controllerAs: "cp",
                bindToController: true,
                targetEvent: $event
            }).then((clickedItem) => {
                clickedItem && console.log(clickedItem.name + ' clicked!');
            });
        }

        removeNote(note: ContactManagerApp.Note): void {
            var foundindex = this.selected.notes.indexOf(note);
            this.selected.notes.splice(foundindex, 1);
            this.openToast("Note was removed");
        }

        addUser($event) {
            var self = this;
            var useFullScreen = (this.$mdMedia('sm') || this.$mdMedia('xs'));

            this.$mdDialog.show({
                templateUrl: './dist/view/newUserDialog.html',
                parent: angular.element(document.body),
                targetEvent: $event,
                controller: AddUserDialogController,
                controllerAs: 'ctrl',
                clickOutsideToClose: true,
                fullscreen: useFullScreen
            }).then((user: CreateUser) => {
                var newUser: User = User.fromCreate(user);
                self.users.push(newUser);
                self.selectUser(newUser);
                self.openToast("User added");
            }, () => {
                console.log('You cancelled the dialog.');
            });
        }

        setFormScope(scope) {
            this.formScope = scope;
        }

        addNote() {
            this.selected.notes.push(this.newNote);

            // reset the form
            this.formScope.noteForm.$setUntouched();
            this.formScope.noteForm.$setPristine();

            this.newNote = new Note('', null);
            this.openToast("Note added");
        }

        clearNotes($event): void {
            console.log($event);
            var confirm = this.$mdDialog.confirm()
                .title('Are you sure you want to delete all notes?')
                .textContent('All notes will be deleted, you can\'t undo this action.')
                .targetEvent($event)
                .ok('Yes')
                .cancel('No');

            var self = this;
            this.$mdDialog.show(confirm).then(() => {
                self.selected.notes = [];
                self.openToast('Cleared notes');
            })
        }

        openToast(message: string): void {
            this.$mdToast.show(
                this.$mdToast
                    .simple()
                    .textContent(message)
                    .position("top right")
                    .hideDelay(3000)
            );
        }

    }

    angular
        .module("contactManagerApp")
        .controller("mainController", MainController);
}