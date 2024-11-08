import ON_DEATH from "death";

type Handler = () => Promise<boolean> | boolean
type Logger = { info: (message: string) => void, error: (message: string) => void };

export class DeathEvent {
    handlers: Map<number, () => Promise<boolean> | boolean> = new Map();
    handlerNames: Map<number, string> = new Map();
    count = 0;
    /**
     * Initialize the DeathEvent manager.
     * This will trigger all handlers when death signal is received.
     * @param logger The logger to use for logging messages.
     */
    constructor(logger: Logger) {
        ON_DEATH(async (signal) => {
            logger.info(`DeathEvent: ${signal} received`);
            logger.info("DeathEvent: Doing cleanup...");
            const cleanupSuccess = await this.prepareToDie(logger);
            if(cleanupSuccess) {
                logger.info("DeathEvent: Cleanup done");
                process.exit(0);
            }else {
                logger.error("DeathEvent: Fail to run all cleanup jobs");
                setTimeout(async () => {
                    process.exit(1);
                }, 100);
            }
        });
    }

    /**
     * Add a job to the death event.
     * @param callback The callback to be called when the death event is triggered.
     * @param name The name of the handler. If not provided, a default one would be provided
     * @returns A unique identifier for the handler.
     */
    addJob(callback: Handler, name?: string) {
        this.handlers.set(this.count, callback);
        if(name) this.handlerNames.set(this.count, name);
        else this.handlerNames.set(this.count, `Untitled job ${this.count}`);
        return this.count++;
    }

    /**
     * Removes a job from the death event.
     * @param id The unique identifier of the handler to be removed.
     */
    removeJob(id: number) {
        this.handlers.delete(id);
        this.handlerNames.delete(id);
    }

    /**
     * Trigger all handlers
     * @returns False if any handler returns false, otherwise true.
     */
    async prepareToDie(logger: Logger) {
        let flag = true;
        for (const id of this.handlers.keys()) {
            const handler = this.handlers.get(id)!;
            if (!await handler()) {
                logger.error(`DeathEvent: Cleanup job "${this.handlerNames.get(id)}" failed`);
                flag = false;
            }
            else {
                logger.info(`DeathEvent: Cleanup job "${this.handlerNames.get(id)}" done`);
            }
        }
        return flag;
    }
}

export default DeathEvent;
