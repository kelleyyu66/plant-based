import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { MooCow } from './components/MooCow'
import { useMyProfile } from './hooks/useData'
import { KitchenSink } from './screens/KitchenSink'
import { Splash } from './screens/onboarding/Splash'
import { Onboarding } from './screens/onboarding/Onboarding'
import { Home } from './screens/home/Home'
import { Meals } from './screens/meals/Meals'
import { MealDetail } from './screens/meals/MealDetail'
import { Leaderboard } from './screens/leaderboard/Leaderboard'
import { Profile } from './screens/profile/Profile'
import { PersonProfile } from './screens/profile/PersonProfile'
import { Education } from './screens/education/Education'

/** Brief hold while the profile loads. Not the branded splash. */
function LoadingScreen() {
  return (
    <div className="grid min-h-screen w-full max-w-phone place-items-center bg-paper">
      <MooCow mood="idle" scale={9} />
    </div>
  )
}

export function App() {
  const { data: profile, isLoading } = useMyProfile()

  /**
   * Prototype behaviour: the splash opens EVERY launch, for onboarded users too.
   *
   * Deliberately React state rather than localStorage — persisting it would show
   * the splash exactly once per browser and never again, which is the opposite of
   * what a demo needs. A refresh is a fresh launch.
   */
  const [splashDone, setSplashDone] = useState(false)
  if (!splashDone) return <Splash onStart={() => setSplashDone(true)} />

  if (isLoading) return <LoadingScreen />

  const onboarded = !!profile

  return (
    <Routes>
      <Route path="/kitchen-sink" element={<KitchenSink />} />
      <Route path="/onboarding" element={onboarded ? <Navigate to="/home" replace /> : <Onboarding />} />

      {onboarded ? (
        <Route element={<AppShell />}>
          <Route path="/home" element={<Home />} />
          <Route path="/meals" element={<Meals />} />
          <Route path="/meals/:id" element={<MealDetail />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:id" element={<PersonProfile />} />
          <Route path="/education" element={<Education />} />
        </Route>
      ) : null}

      <Route path="*" element={<Navigate to={onboarded ? '/home' : '/onboarding'} replace />} />
    </Routes>
  )
}
