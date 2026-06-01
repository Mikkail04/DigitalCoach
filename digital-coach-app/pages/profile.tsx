import React from 'react';
import Avatar from '@App/components/atoms/Avatar';
import Card from '@App/components/atoms/Card';
import { useAuth } from "@App/lib/auth/AuthContextProvider";
import AuthGuard from '@App/lib/auth/AuthGuard';
import styles from '@App/styles/ProfilePage.module.scss';

export default function ProfilePage() {
  const { userData } = useAuth();

  return (
	<AuthGuard>
		<div className={styles.ProfilePage}>
			<h1>Your Profile</h1>

			<div className={styles.ProfilePage_avatarWrapper}>
				{userData?.avatarURL && (
				<Avatar size={125} src={userData?.avatarURL} alt="Profile Picture"/>
				)}
			</div>

			<div className={styles.ProfilePage_body}>
				<div className={styles.ProfilePage_bodyLeft}>
				<Card title='Name'>{userData?.name}</Card>
				<Card title='Email'>{userData?.email}</Card>
				</div>

				<div className={styles.ProfilePage_bodyRight}>
				<Card title='Major'>{userData?.concentration}</Card>
				<Card title='Experience Level'>
					{userData?.proficiency}
				</Card>
				</div>
			</div>
		</div>
	</AuthGuard>
  );
}