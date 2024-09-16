import { Dashboard } from "../../../providers/constants";
import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { AuthHttpService } from '../../../providers/AjaxServices/auth-http.service';
import { iNavigation } from "../../../providers/iNavigation";
import { JwtService, ResponseModel } from "../../../auth/jwtService";
import { environment } from "../../../environments/environment";
import { convertToUppercase, ErrorToast, HideModal, ShowModal, Toast } from "../../../providers/common-service/common.service";
import { CommonModule } from "@angular/common";
import { ButtonSubmitComponent } from "../../util/button-submit/button-submit.component";
import packageJson from '../../../../package.json';

@Component({
  standalone: true,
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
  imports: [CommonModule, ButtonSubmitComponent]
})
export class LoginComponent implements OnInit {
  title = "Business manager";
  initialUrl: string = "";
  catagory: any = {};
  isLoading: boolean = false;
  isUserMode: boolean = true;
  userType: string = 'system';
  isLoginPage: boolean = true;
  registrationValue: any = {};
  loginValue: any = {};
  agreeWithTermsAndCondition: boolean = false;
  isRegistrationDone: boolean = false;
  isShowPassword: boolean = false;
  isLocal: boolean = false;
  appVersion = packageJson.version;
  @Output() userAuthState = new EventEmitter();

  UserForm = {
    UserId: "",
    Password: "",
    ConfirmPassword: "",
    RegistrationCode: "",
    ShopName: "",
    MobileNo: ""
  };

  showPassword() {
    document.getElementById('Password').setAttribute('type', 'text');
    this.isShowPassword = true;
  }

  hidePassword() {
    document.getElementById('Password').setAttribute('type', 'password');
    this.isShowPassword = false;
  }

  constructor(
    private nav: iNavigation,
    private jwtService: JwtService,
    private authHttp: AuthHttpService
  ) { }

  ngOnInit() {
    if(environment.env == "local"){
      this.isLocal = true;
    }

    this.isRegistrationDone = false;
    localStorage.clear();
    sessionStorage.clear();
    this.nav.clearNavigation();
  }

  switchMode() {
    this.isUserMode = !this.isUserMode;
  }

  UserLogin() {
    if (this.UserForm) {
      this.isLoading = true;
      this.loginValue = {
        password: null,
        emailId: null,
        mobileNumber: null,
      };

      let userId: any = document.getElementById("EmailOrMobile");
      let password: any = document.getElementById("Password");
      let companyCode: any = document.getElementById("CompanyCode");

      if (!userId.value) {
        this.isLoading = false;
        ErrorToast("Please enter email or mobile");
        return;
      }

      if (!password.value) {
        this.isLoading = false;
        ErrorToast("Please enter the password");
        return;
      }

      if (!companyCode.value) {
        this.isLoading = false;
        ErrorToast("Please enter the password");
        return;
      }

      let termAndService: any = (document.getElementById("gridCheck") as HTMLInputElement).checked;
      if (!termAndService) {
        this.isLoading = false;
        ErrorToast("Please agree with our term and service");
        return;
      }

      if (userId.value !== "" && password.value !== "") {
        if(userId.value.indexOf("@") !== -1) {
          this.loginValue.emailId = userId.value;
        } else {
          this.loginValue.mobileNumber = userId.value;
        }

        this.loginValue.password = password.value;
        this.loginValue.CompanyCode = companyCode.value;
        this.authHttp.login('authenticate', this.loginValue).then((result: ResponseModel) => {
          if (result.ResponseBody) {
            let Data = result.ResponseBody;
            this.jwtService.setLoginDetail(Data);
            Toast("Please wait loading dashboard ...", 15);
            this.nav.navigateRoot(Dashboard, null);
          } else {
            ErrorToast("Incorrect username or password. Please try again.");
          }
        }).catch(e => {
          this.isLoading = false;
        });
      }
    }
  }

  ResetSignUpForm() {
    this.UserForm.UserId = '';
    this.UserForm.Password = '';
    this.UserForm.ConfirmPassword = '';
    this.UserForm.RegistrationCode = '';
    this.UserForm.ShopName = '';
    this.UserForm.MobileNo = null;
    ShowModal("signup");
    const signInElement = document.getElementById('signin');
    if (signInElement) {
      signInElement.style.display = 'block';
    }
  }

  SignupUser() {
    this.isLoading = true;
    if (this.UserForm) {
      // let UserSighupData = this.UserForm.getRawValue();
      // if (UserSighupData.Password === UserSighupData.ConfirmPassword) {
      //   this.http.post("Authentication/ShopSigup", UserSighupData).then(
      //     result => {
      //       if (result.ResponseBody) {
      //         // this.commonService.ShowToast("Registration done successfully");
      //         this.ResetSignUpForm();
      //       }
      //       this.isLoading = false;
      //     },
      //     error => {
      //       this.isLoading = false;
      //       // this.commonService.ShowToast("Registration fail. Please contact to admin.");
      //     }
      //   );
      // } else {
      //   this.isLoading = false;
      //   // this.commonService.ShowToast("Password and Confirmpassword is not matching.");
      // }
    } else {
      this.isLoading = false;
    }
  }

  changePopup(status: string) {
    this.isRegistrationDone = false;
    if (status == 'loginPage') {
      this.isLoginPage = true;
      this.loginValue = null;
      this.registrationValue = null;
    }
    else {
      this.isLoginPage = false;
      this.loginValue = null;
      this.registrationValue = null;
    }
  }

  enableSignUp(e: any) {
    if (e.currentTarget.checked == true)
      this.agreeWithTermsAndCondition = true;
    else
      this.agreeWithTermsAndCondition = false;
  }

  userRegistration() {
    this.isLoading = true;
    this.registrationValue = {
      EmailId: null,
      Mobile: null,
      OrganizationName: null,
      CompanyName: null,
      AuthenticationCode: null,
    };
    this.registrationValue.EmailId = (<HTMLInputElement>document.getElementById("Email")).value;
    this.registrationValue.Mobile =(<HTMLInputElement>document.getElementById("Mobile")).value;
    this.registrationValue.CompanyName =(<HTMLInputElement>document.getElementById("CompanyName")).value;
    this.registrationValue.OrganizationName =(<HTMLInputElement>document.getElementById("OrganizationName")).value;
    this.registrationValue.AuthenticationCode =(<HTMLInputElement>document.getElementById("AuthenticationCode")).value;

    let errorCounter = 0;
    if (!this.registrationValue.EmailId || this.registrationValue.EmailId == "")
      errorCounter++;
    if (!this.registrationValue.Mobile || this.registrationValue.Mobile == "")
      errorCounter++;
    if (!this.registrationValue.CompanyName || this.registrationValue.CompanyName == "")
      errorCounter++;
    if (!this.registrationValue.OrganizationName || this.registrationValue.OrganizationName == "")
      errorCounter++;
    if (!this.registrationValue.AuthenticationCode || this.registrationValue.AuthenticationCode == '')
      errorCounter++;

    if (this.registrationValue && errorCounter === 0) {
      this.authHttp.post('login/SignUpNew', this.registrationValue).then((result: ResponseModel) => {
        if (result.ResponseBody) {
          Toast("Registration done");
          this.isLoginPage = false;
          this.isRegistrationDone = true;
        } else {
          ErrorToast("Fail to registration. Please contact to admin.");
        }
        this.isLoading = false;
      }).catch(e => {
        this.isLoading = false;
      });
    } else {
      this.isLoading = false;
    }
  }

  validateEmail() {
    let value = (<HTMLInputElement>document.getElementById("Email")).value
    this.emailValidation(value);
  }

  emailValidation(value: any) {
    let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (regex.test(value))
      return (true)
    else {
      ErrorToast("Invalid email address!")
      return (false)
    }
  }

  AllowMobilenoOnly(e: any) {
    let $e: any = event;
  }

  EnableSignup() {
    HideModal("signin");
    const signInElement = document.getElementById('signin');
    if (signInElement) {
      signInElement.style.display = 'block';
    }
  }

  isScrollbarBottom(container: any) {
    var height = container.outerHeight();
    var scrollHeight = container[0].scrollHeight;
    var scrollTop = container.scrollTop();
    if (scrollTop >= scrollHeight - height) {
      return true;
    }
    return false;
  }

  refreshToken(): void {
    // this.authService.refreshAuthToken(GoogleLoginProvider.PROVIDER_ID).then(user => {

    // });
  }

  onGoogleSignIn() {
    //this.isGoogleLogin = true;
    event.preventDefault();
    // this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then((user: any) => {
    //   if(user !== null) {
    //     let userSignInDetail = {
    //       UserId: 0,
    //       FirstName: user.firstName,
    //       LastName: user.lastName,
    //       Mobile: null,
    //       EmailId: user.email,
    //       Address: null,
    //       CompanyName: null,
    //       MediaName: "google",
    //       AccessToken: user.response.access_token
    //     };

    //     this.http.post("login/SignUpViaSocialMedia", userSignInDetail).then((response: ResponseModel) => {
    //       if(response.ResponseBody !== null && response.ResponseBody !== "") {
    //         this.jwtService.setLoginDetail(response.ResponseBody);
    //         this.commonService.ShowToast("Registration done successfully");
    //         this.nav.navigate("/", null);
    //       }
    //       this.isGoogleLogin = false;
    //     }).catch(err => {
    //       this.isGoogleLogin = false;
    //       this.commonService.ShowToast("Got some internal error. Please contact admin.");
    //     });
    //   } else {
    //     this.commonService.ShowToast("Registration fail. Please contact to admin.");
    //   }
    // }).catch(e => {
    //   this.isGoogleLogin = false;
    // });
  }

  gotoLogin() {
    this.isLoginPage = true;
    this.isRegistrationDone = false;
  }

  backToHomePage() {
    this.nav.navigate("/", null);
  }

  enableSystem() {
    this.userType = "system";
  }

  enableEmployee() {
    this.userType = "employee";
  }

  forgotPasswordModal() {
    (<HTMLInputElement> document.getElementById('registeredEmailId')).value = "";
    (<HTMLInputElement> document.getElementById('RegisterCompanyCode')).value = "";
    ShowModal("ForgotPasswordModal");
  }

  sendForgotPassword() {
    this.isLoading = true;
    let email: string = (<HTMLInputElement> document.getElementById('registeredEmailId')).value;
    let companyCode = (<HTMLInputElement> document.getElementById('RegisterCompanyCode')).value;
    if(email && email != '' && this.emailValidation(email) && companyCode) {
      let value = {
        EmailId: email,
        CompanyCode: companyCode
      }
      this.authHttp.forgotPassword('Login/ForgotPassword', value).then(res => {
        if (res.ResponseBody) {
          Toast("Password send on your email id. Please check your email");
          HideModal("ForgotPasswordModal");
        }
        this.isLoading = false;
      }).catch(e => {
        this.isLoading = false;
      })
    }
  }

  inputToUppercase(event: Event) {
    convertToUppercase(event)
  }
}
