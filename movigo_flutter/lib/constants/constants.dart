class AppImages {
  static const String onboarding1 = "assets/images/onboarding1.png";
  static const String onboarding2 = "assets/images/onboarding2.png";
  static const String onboarding3 = "assets/images/onboarding3.png";
  static const String getStarted = "assets/images/get-started.png";
  static const String signUpCar = "assets/images/signup-car.png";
  static const String check = "assets/images/check.png";
  static const String noResult = "assets/images/no-result.png";
  static const String message = "assets/images/message.png";
}

class AppIcons {
  static const String arrowDown = "assets/icons/arrow-down.png";
  static const String arrowUp = "assets/icons/arrow-up.png";
  static const String backArrow = "assets/icons/back-arrow.png";
  static const String chat = "assets/icons/chat.png";
  static const String checkmark = "assets/icons/check.png";
  static const String close = "assets/icons/close.png";
  static const String dollar = "assets/icons/dollar.png";
  static const String email = "assets/icons/email.png";
  static const String eyecross = "assets/icons/eyecross.png";
  static const String google = "assets/icons/google.png";
  static const String home = "assets/icons/home.png";
  static const String list = "assets/icons/list.png";
  static const String lock = "assets/icons/lock.png";
  static const String map = "assets/icons/map.png";
  static const String marker = "assets/icons/marker.png";
  static const String out = "assets/icons/out.png";
  static const String person = "assets/icons/person.png";
  static const String pin = "assets/icons/pin.png";
  static const String point = "assets/icons/point.png";
  static const String profile = "assets/icons/profile.png";
  static const String search = "assets/icons/search.png";
  static const String selectedMarker = "assets/icons/selected-marker.png";
  static const String star = "assets/icons/star.png";
  static const String target = "assets/icons/target.png";
  static const String to = "assets/icons/to.png";
}

class OnboardingItem {
  final int id;
  final String title;
  final String description;
  final String image;

  const OnboardingItem({
    required this.id,
    required this.title,
    required this.description,
    required this.image,
  });
}

const List<OnboardingItem> onboardingData = [
  OnboardingItem(
    id: 1,
    title: "¡El viaje perfecto está a un toque de distancia!",
    description: "Tu aventura comienza con MoviGO. Encuentra tu viaje ideal fácilmente.",
    image: AppImages.onboarding1,
  ),
  OnboardingItem(
    id: 2,
    title: "El mejor auto en tus manos con MoviGO",
    description: "Descubre la comodidad de encontrar tu viaje perfecto con MoviGO",
    image: AppImages.onboarding2,
  ),
  OnboardingItem(
    id: 3,
    title: "Tu viaje, a tu manera. ¡Vamos!",
    description: "Ingresa tu destino, relájate y nosotros nos encargamos del resto.",
    image: AppImages.onboarding3,
  ),
];
