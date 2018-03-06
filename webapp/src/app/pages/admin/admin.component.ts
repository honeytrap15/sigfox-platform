import {Component, OnDestroy, OnInit, ViewChild, ViewChildren} from '@angular/core';
import {AppSetting, Category, Device, FireLoopRef, User} from '../../shared/sdk/models';
import {AppSettingApi ,CategoryApi, DeviceApi, RealTime, UserApi} from '../../shared/sdk/services';
import {ToasterConfig, ToasterService} from 'angular2-toaster';

@Component({
  selector: 'app-messages',
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit, OnDestroy {

  private user: User;
  private userToRemove: User;
  private users: User[] = [];

  private setting: AppSetting;
  private settings: AppSetting[] = [];

  @ViewChild('updateUserModal') updateUserModal: any;
  @ViewChild('confirmModal') confirmModal: any;

  // Notifications

  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      tapToDismiss: true,
      timeout: 5000,
      animation: 'fade'
    });


  constructor(private rt: RealTime,
              private userApi: UserApi,
              private appSettingApi: AppSettingApi,
              private toasterService: ToasterService) {

    this.toasterService = toasterService;
  }

  ngOnInit(): void {
    console.log('Admin: ngOnInit');

    // Real Time
    if (this.rt.connection.isConnected() && this.rt.connection.authenticated)
      this.setup();
    else
      this.rt.onAuthenticated().subscribe(() => this.setup());

  }

  setup(): void {
    this.getUsers();
    this.getAppSettings();
  }

  getUsers(): void {
    this.user = this.userApi.getCachedCurrent();
    this.userApi.find({include: "roles", order: 'updatedAt DESC'}).subscribe((users: User[]) => {
      this.users = users;
      console.log(users);
    });
  }

  getAppSettings(): void {
    this.appSettingApi.find().subscribe((settings: AppSetting[])=> {
      this.settings = settings;
    });
  }

  showRemoveModal(user: User): void {
    this.confirmModal.show();
    this.userToRemove = user;
  }

  deleteUser(): void {
    console.log(this.userToRemove);
    this.userApi.deleteById(this.userToRemove.id).subscribe((value: any) => {
      this.toasterService.pop('success', 'Success', 'Account was deleted successfully.');
      this.confirmModal.hide();
      this.getUsers();
    });
  }

  changeSetting(setting: AppSetting): void{
    //setting.value = !setting.value;
    this.appSettingApi.upsert(setting).subscribe((setting: any)=> {
      console.log(setting);
    });
  }


  ngOnDestroy(): void {
    console.log('Admin: ngOnDestroy');
  }

}
