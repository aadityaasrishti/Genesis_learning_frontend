import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getSchoolInfo } from "../../utils/schoolUtils";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Grid,
  CardContent,
  IconButton,
  Paper,
} from "@mui/material";
import {
  Timer,
  AutoStories,
  QuestionAnswer,
  Facebook,
  Twitter,
  Instagram,
} from "@mui/icons-material";
import {
  HeroSection,
  FeatureCard,
  TimerSection,
  TimerDisplay,
  TestimonialCard,
  PricingCard,
} from "../../theme/StyledComponents";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState(1500);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const schoolInfo = getSchoolInfo();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  useEffect(() => {
    let timerInterval: ReturnType<typeof setInterval>;
    if (isTimerRunning && timeLeft > 0) {
      timerInterval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setIsTimerRunning(false);
            return 1500;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [isTimerRunning]);

  const startTimer = () => {
    if (!isTimerRunning) {
      setTimeLeft(1500);
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Box>
      {/* Navigation */}
      <AppBar position="fixed" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {schoolInfo.name}
          </Typography>
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
            <Button color="inherit" onClick={() => scrollToSection("tools")}>
              Features
            </Button>
            <Button color="inherit" onClick={() => scrollToSection("pricing")}>
              Pricing
            </Button>
            <Button
              color="inherit"
              onClick={() => scrollToSection("testimonials")}
            >
              Testimonials
            </Button>
            <Button color="inherit" onClick={() => scrollToSection("faq")}>
              FAQ
            </Button>
            <Button color="inherit" onClick={() => navigate("/login")}>
              Sign In
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate("/register")}
            >
              Sign Up
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar /> {/* Spacer */}
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            Welcome to {schoolInfo.name}
          </Typography>
          <Typography variant="h5" paragraph>
            Your ultimate study companion for acing exams and mastering
            subjects.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => navigate("/register")}
            sx={{ mt: 2 }}
          >
            Get Started
          </Button>
        </Container>
      </HeroSection>
      {/* Features Section */}
      <Box id="tools" sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            textAlign="center"
            gutterBottom
          >
            Explore Our Study Tools
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} md={4}>
              <FeatureCard>
                <CardContent>
                  <AutoStories
                    sx={{ fontSize: 40, color: "primary.main", mb: 2 }}
                  />
                  <Typography variant="h5" component="h3" gutterBottom>
                    Flashcards
                  </Typography>
                  <Typography>
                    Create and share custom flashcards for quick revision.
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureCard>
                <CardContent>
                  <QuestionAnswer
                    sx={{ fontSize: 40, color: "primary.main", mb: 2 }}
                  />
                  <Typography variant="h5" component="h3" gutterBottom>
                    Quizzes
                  </Typography>
                  <Typography>
                    Test your knowledge with interactive quizzes.
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureCard>
                <CardContent>
                  <Timer sx={{ fontSize: 40, color: "primary.main", mb: 2 }} />
                  <Typography variant="h5" component="h3" gutterBottom>
                    Study Planner
                  </Typography>
                  <Typography>
                    Organize your study schedule and track your progress.
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
          </Grid>
        </Container>
      </Box>
      {/* Study Timer Section */}
      <TimerSection>
        <Container maxWidth="sm">
          <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h4" gutterBottom>
              Study Timer
            </Typography>
            <TimerDisplay>{formatTime(timeLeft)}</TimerDisplay>
            <Button
              variant="contained"
              color="primary"
              onClick={startTimer}
              size="large"
            >
              {isTimerRunning ? "Stop Timer" : "Start Timer"}
            </Button>
          </Paper>
        </Container>
      </TimerSection>
      {/* Pricing Section */}
      <Box id="pricing" sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            textAlign="center"
            gutterBottom
          >
            Affordable Pricing Plans
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} md={6}>
              <PricingCard>
                <CardContent>
                  <Typography variant="h4" gutterBottom>
                    Free
                  </Typography>
                  <Typography variant="h3" component="div" gutterBottom>
                    $0/month
                  </Typography>
                  <Typography>Access to basic tools</Typography>
                </CardContent>
                <Box sx={{ p: 2 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    onClick={() => navigate("/register")}
                  >
                    Sign Up
                  </Button>
                </Box>
              </PricingCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <PricingCard className="premium">
                <CardContent>
                  <Typography variant="h4" gutterBottom>
                    Pro
                  </Typography>
                  <Typography variant="h3" component="div" gutterBottom>
                    $9.99/month
                  </Typography>
                  <Typography>Unlock all features</Typography>
                </CardContent>
                <Box sx={{ p: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
                    onClick={() => navigate("/register")}
                  >
                    Get Pro
                  </Button>
                </Box>
              </PricingCard>
            </Grid>
          </Grid>
        </Container>
      </Box>
      {/* Testimonials Section */}
      <Box id="testimonials" sx={{ bgcolor: "grey.100", py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            textAlign="center"
            gutterBottom
          >
            What Students Are Saying
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} md={6}>
              <TestimonialCard>
                <CardContent>
                  <Typography variant="body1" paragraph>
                    "StudyHub helped me stay organized and ace my finals!"
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    - Jane D.
                  </Typography>
                </CardContent>
              </TestimonialCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <TestimonialCard>
                <CardContent>
                  <Typography variant="body1" paragraph>
                    "The flashcards and quizzes are a game-changer!"
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    - John S.
                  </Typography>
                </CardContent>
              </TestimonialCard>
            </Grid>
          </Grid>
        </Container>
      </Box>
      {/* FAQ Section */}
      <Box id="faq" sx={{ py: 8 }}>
        <Container maxWidth="md">
          <Typography
            variant="h3"
            component="h2"
            textAlign="center"
            gutterBottom
          >
            Frequently Asked Questions
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Is {schoolInfo.name} free?
            </Typography>
            <Typography paragraph>
              Yes, we offer a free plan with basic features. Upgrade to Pro for
              more tools.
            </Typography>
            <Typography variant="h6" gutterBottom>
              Can I use {schoolInfo.name} on my phone?
            </Typography>
            <Typography paragraph>
              Absolutely! {schoolInfo.name} is fully responsive and works on
              all devices.
            </Typography>
          </Box>
        </Container>
      </Box>
      {/* Footer */}
      <Box
        component="footer"
        sx={{ bgcolor: "grey.900", color: "white", py: 6 }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" align="center">
            © 2024 {schoolInfo.name}. All rights reserved.
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <IconButton
              color="inherit"
              onClick={() => window.open("https://facebook.com", "_blank")}
            >
              <Facebook />
            </IconButton>
            <IconButton
              color="inherit"
              onClick={() => window.open("https://twitter.com", "_blank")}
            >
              <Twitter />
            </IconButton>
            <IconButton
              color="inherit"
              onClick={() => window.open("https://instagram.com", "_blank")}
            >
              <Instagram />
            </IconButton>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
