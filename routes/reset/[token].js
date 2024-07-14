import { redirect, view } from 'primate';

export default {
    async get(request) {
        const { path, store, session } = request;
        const { User } = store;
        const token = path.get("token")

        const user = await User.getByPasswordResetToken(token);

        if (!user) {
            return "Invalid reset token";
        }
        if (user.passwordReset.expiration < new Date().toISOString()) {
            return "Reset token is expired";
        }

        return view("reset/ResetPassword.svelte", { email: user.email });

    },
    async post(request) {
        const { path, store, session, body } = request;
        const { User } = store;
        const token = path.get("token");
        const { new_password, confirm_password } = body;

        const user = await User.getByPasswordResetToken(token);

        if (!user) {
            return "Invalid reset token";
        }

        if (user.passwordReset.expiration < new Date().toISOString()) {
            return "Reset token is expired";
        }

        if (!new_password || !confirm_password) {
            return view("reset/ResetPassword.svelte", { email: user.email, status: "Please fill out all fields" });
        }

        if (new_password !== confirm_password) {
            return view("reset/ResetPassword.svelte", { email: user.email, status: "Passwords do not match" });
        }

        const result = await User.updatePassword(user.id, new_password);

        if(result) {
            await User.deletePasswordResetToken(user.id);
            return view("reset/ResetPassword.svelte", { email: user.email, status: "Password reset successfully" });
        }

        return view("reset/ResetPassword.svelte", { email: user.email, status: "An error occured" });
    }
};
