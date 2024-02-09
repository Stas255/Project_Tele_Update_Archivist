export class Mutex {
    private mutex = Promise.resolve();
    private isLocked = false;

    // Lock the mutex. Returns a promise that resolves to an unlock function.
    lock(): PromiseLike<() => void> {
        let begin: (unlock: () => void) => void = unlock => {};

        this.mutex = this.mutex.then(() => {
            this.isLocked = true;
            return new Promise(begin);
        });

        return new Promise(res => {
            begin = res;
        });
    }

    // Execute a function with the mutex locked.
    async dispatch(fn: () => Promise<void>) {
        this.isLocked = true;
        const unlock = await this.lock();
        try {
            await fn();
        } catch (err) {
            console.error('Error executing function:', err);
        } finally {
            this.isLocked = false;
            unlock();
        }
    }

    isExecuting(): boolean {
        return this.isLocked;
    }
}