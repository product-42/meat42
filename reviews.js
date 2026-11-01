import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDISjeGP2W4IBCQY79wIZJbo5VZx22TI04",
  authDomain: "home-food-reviews.firebaseapp.com",
  projectId: "home-food-reviews",
  storageBucket: "home-food-reviews.firebasestorage.app",
  messagingSenderId: "847479016295",
  appId: "1:847479016295:web:213f4a50b7cc9ef59b3dc2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const reviewForm = document.getElementById("review-form");
const reviewName = document.getElementById("review-name");
const reviewText = document.getElementById("review-text");
const reviewRating = document.getElementById("review-rating");
const reviewMessage = document.getElementById("review-message");
const reviewsList = document.getElementById("reviews-list");

if (
  !reviewForm ||
  !reviewName ||
  !reviewText ||
  !reviewRating ||
  !reviewMessage ||
  !reviewsList
) {
  console.error(
    "Не найдены элементы формы. Проверьте ID: review-form, review-name, review-text, review-rating, review-message, reviews-list."
  );
} else {
  const reviewsCollection = collection(db, "reviews");

  reviewForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = reviewName.value.trim();
    const text = reviewText.value.trim();
    const rating = Number(reviewRating.value);

    if (name.length < 2 || name.length > 50) {
      reviewMessage.textContent =
        "Имя должно содержать от 2 до 50 символов.";
      return;
    }

    if (text.length < 5 || text.length > 1000) {
      reviewMessage.textContent =
        "Отзыв должен содержать от 5 до 1000 символов.";
      return;
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      reviewMessage.textContent =
        "Выберите оценку от 1 до 5.";
      return;
    }

    reviewMessage.textContent = "Отправка...";

    try {
      await addDoc(reviewsCollection, {
        name,
        text,
        rating,
        status: "pending",
        createdAt: serverTimestamp()
      });

      reviewForm.reset();
      reviewMessage.textContent =
        "Спасибо! Отзыв отправлен на модерацию.";
    } catch (error) {
      console.error("Ошибка отправки отзыва:", error);
      reviewMessage.textContent =
        "Не удалось отправить отзыв. Проверьте правила Firestore.";
    }
  });

  async function loadReviews() {
    reviewsList.textContent = "Загрузка отзывов...";

    try {
      const reviewsQuery = query(
        reviewsCollection,
        where("status", "==", "approved"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(reviewsQuery);

      reviewsList.innerHTML = "";

      if (snapshot.empty) {
        reviewsList.textContent =
          "Пока опубликованных отзывов нет.";
        return;
      }

      snapshot.forEach((documentSnapshot) => {
        const review = documentSnapshot.data();

        const article = document.createElement("article");
        article.className = "review-card";

        const header = document.createElement("div");
        header.className = "review-card__header";

        const author = document.createElement("strong");
        author.textContent = review.name || "Пользователь";

        const rating = document.createElement("span");
        rating.className = "review-card__rating";

        const reviewRatingValue = Number(review.rating) || 0;
        rating.textContent =
          "★".repeat(reviewRatingValue) +
          "☆".repeat(5 - reviewRatingValue);

        const text = document.createElement("p");
        text.textContent = review.text || "";

        header.append(author, rating);
        article.append(header, text);
        reviewsList.appendChild(article);
      });
    } catch (error) {
      console.error("Ошибка загрузки отзывов:", error);

      reviewsList.innerHTML =
        "<p>Не удалось загрузить отзывы. Проверьте индекс и правила Firestore.</p>";
    }
  }

  loadReviews();
}